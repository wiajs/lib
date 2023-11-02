/*!
 * HTML5 export buttons for Buttons and DataTables.
 * 2016 SpryMedia Ltd - datatables.net/license
 *
 * FileSaver.js (1.3.3) - MIT license
 * Copyright © 2016 Eli Grey - http://eligrey.com
 */
import {saveAs} from 'file-saver';
import {excelStrings, excelSpecials} from './constant';

const Zip = require('jszip');

const _def = {
  fileName: '*',
  extension: '.xlsx',
  exportOptions: {},
  header: true,
  footer: false,
  title: '',
  messageTop: '',
  messageBottom: '',
  createEmptyCells: false,
  autoFilter: false,
  sheetName: 'Sheet1',
};

export default class SaveExcel {
  _serialiser = null;
  _ieExcel = false;
  _exportTextarea = $('<textarea/>')[0];
  sheetName = 'Sheet1';
  doc = null;

  constructor(head, data, opt) {
    try {
      this.opt = {..._def, ...opt};
      this._serialiser = new XMLSerializer();
      this.head = head;
      this.data = data;

      if (this.opt.sheetName) this.sheetName = this.opt.sheetName.replace(/[\[\]\*\/\\\?\:]/g, '');
    } catch (e) {
      console.error('SaveExcel constructor exp:', e.message);
    }
  }

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Local (private) functions
   */

  /**
   * Older versions of Safari (prior to tech preview 18) don't support the
   * download option required.
   *
   * @return {Boolean} `true` if old Safari
   */
  isDuffSafari() {
    const safari =
      navigator.userAgent.indexOf('Safari') !== -1 &&
      navigator.userAgent.indexOf('Chrome') === -1 &&
      navigator.userAgent.indexOf('Opera') === -1;

    if (!safari) {
      return false;
    }

    const version = navigator.userAgent.match(/AppleWebKit\/(\d+\.\d+)/);
    if (version && version.length > 1 && version[1] * 1 < 603.1) {
      return true;
    }

    return false;
  }

  /**
   * Convert from numeric position to letter for column names in Excel
   * @param  {int} n Column number
   * @return {string} Column letter(s) name
   */
  createCellPos(n) {
    const ordA = 'A'.charCodeAt(0);
    const ordZ = 'Z'.charCodeAt(0);
    const len = ordZ - ordA + 1;
    let s = '';

    while (n >= 0) {
      s = String.fromCharCode((n % len) + ordA) + s;
      n = Math.floor(n / len) - 1;
    }

    return s;
  }

  /**
   * Recursively add XML files from an object's structure to a ZIP file. This
   * allows the XSLX file to be easily defined with an object's structure matching
   * the files structure.
   *
   * @param {JSZip} zip ZIP package
   * @param {object} obj Object to add (recursive)
   */
  addToZip(zip, obj) {
    const self = this;

    if (self._ieExcel === undefined) {
      // Detect if we are dealing with IE's _awful_ serialiser by seeing if it
      // drop attributes
      self._ieExcel =
        self._serialiser
          .serializeToString(
            new window.DOMParser().parseFromString(
              excelStrings['xl/worksheets/sheet1.xml'],
              'text/xml'
            )
          )
          .indexOf('xmlns:r') === -1;
    }

    $.each(obj, function (name, val) {
      if ($.isPlainObject(val)) {
        self.addToZip(zip.folder(name), val);
      } else {
        if (self._ieExcel) {
          // IE's XML serialiser will drop some name space attributes from
          // from the root node, so we need to save them. Do this by
          // replacing the namespace nodes with a regular attribute that
          // we convert back when serialised. Edge does not have this
          // issue
          const worksheet = val.childNodes[0];
          let i;
          let ien;
          const attrs = [];

          for (i = worksheet.attributes.length - 1; i >= 0; i--) {
            const attrName = worksheet.attributes[i].nodeName;
            const attrValue = worksheet.attributes[i].nodeValue;

            if (attrName.indexOf(':') !== -1) {
              attrs.push({name: attrName, value: attrValue});

              worksheet.removeAttribute(attrName);
            }
          }

          for (i = 0, ien = attrs.length; i < ien; i++) {
            const attr = val.createAttribute(attrs[i].name.replace(':', '_dt_b_namespace_token_'));
            attr.value = attrs[i].value;
            worksheet.setAttributeNode(attr);
          }
        }

        let str = self._serialiser.serializeToString(val);

        // Fix IE's XML
        if (self._ieExcel) {
          // IE doesn't include the XML declaration
          if (str.indexOf('<?xml') === -1) {
            str = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'${str}`;
          }

          // Return namespace attributes to being as such
          str = str.replace(/_dt_b_namespace_token_/g, ':');

          // Remove testing name space that IE puts into the space preserve attr
          str = str.replace(/xmlns:NS[\d]+="" NS[\d]+:/g, '');
        }

        // Safari, IE and Edge will put empty name space attributes onto
        // various elements making them useless. This strips them out
        str = str.replace(/<([^<>]*?) xmlns=""([^<>]*?)>/g, '<$1 $2>');

        zip.file(name, str);
      }
    });
  }

  /**
   * Create an XML node and add any children, attributes, etc without needing to
   * be verbose in the DOM.
   *
   * @param  {object} doc      XML document
   * @param  {string} nodeName Node name
   * @param  {object} opts     Options - can be `attr` (attributes), `children`
   *   (child nodes) and `text` (text content)
   * @return {node}            Created node
   */
  createNode(doc, nodeName, opts) {
    const tempNode = doc.createElement(nodeName);

    if (opts) {
      if (opts.attr) {
        $(tempNode).attr(opts.attr);
      }

      if (opts.children) {
        $.each(opts.children, function (key, value) {
          tempNode.appendChild(value);
        });
      }

      if (opts.text !== null && opts.text !== undefined) {
        tempNode.appendChild(doc.createTextNode(opts.text));
      }
    }

    return tempNode;
  }

  /**
   * Get the width for an Excel column based on the contents of that column
   * @param  {object} data Data for export
   * @param  {int}    col  Column index
   * @return {int}         Column width
   */
  excelColWidth(col) {
    let len;
    let lineSplit;
    let str;

    let max = this.head[col].length * 2;

    if (this.foot && this.foot[col].length > max) {
      max = this.foot[col].length * 2;
    }

    for (let i = 0, ien = this.data.length; i < ien; i++) {
      const point = this.data[i][col];
      str = point !== null && point !== undefined ? point.toString() : '';

      // If there is a newline character, workout the width of the column
      // based on the longest line in the string
      if (str.indexOf('\n') !== -1) {
        lineSplit = str.split('\n');
        lineSplit.sort(function (a, b) {
          return b.length - a.length;
        });

        len = lineSplit[0].length;
      } else {
        len = str.length;
      }

      if (len > max) {
        max = len;
      }

      // Max width rather than having potentially massive column widths
      if (max > 40) {
        return 54; // 40 * 1.35
      }
    }

    max *= 1.35;

    // And a min width
    return max > 6 ? max : 6;
  }

  available() {
    return window.FileReader !== undefined && !this.isDuffSafari() && this._serialiser;
  }

  text(dt) {
    return dt.i18n('buttons.excel', 'Excel');
  }

  mergeCells(row, colspan) {
    const {doc} = this;
    const mergeCells = $('mergeCells', doc);

    if (mergeCells.length) {
      mergeCells[0].appendChild(
        this.createNode(doc, 'mergeCell', {
          attr: {
            ref: `A${row}:${this.createCellPos(colspan)}${row}`,
          },
        })
      );
      mergeCells.attr('count', parseFloat(mergeCells.attr('count')) + 1);
    }
    // jquery eq(start 0) -> nth-child(start 1)
    $(`row:nth-child(${row}) c`, doc).attr('s', '51'); // centre
    // $('row:nth-child(${row}) c', doc).attr('s', '2'); // bold
  }

  // Cross-browser xml parsing
  parseXML(data) {
    let R = null;
    try {
      if (window.DOMParser) {
        // Standard
        const tmp = new DOMParser();
        R = tmp.parseFromString(data, 'text/xml');
      } else {
        // IE
        const xml = new ActiveXObject('Microsoft.XMLDOM');
        xml.async = 'false';
        R = xml.loadXML(data);
      }
    } catch (e) {
      console.error('parseXML exp:', e.message);
    }

    if (!R || !R.documentElement || R.getElementsByTagName('parsererror').length) {
      console.error('Invalid XML: ', data);
    }
    return R;
  }

  getXml(type) {
    const str = excelStrings[type];
    // str = str.replace( /xmlns:/g, 'xmlns_' ).replace( /mc:/g, 'mc_' );
    return this.parseXML(str);
  }

  addRow(row, rowPos, hide) {
    const {doc} = this;
    const currentRow = rowPos + 1;
    const rowNode = this.createNode(doc, 'row', {attr: {r: currentRow}});

    let col = -1; // 隐藏字段需跳过
    for (let i = 0, len = row.length; i < len; i++) {
      // 跳过隐藏列，隐藏列不导出！
      if (hide?.includes(i)) continue;

      col++;

      // Concat both the Cell Columns as a letter and the Row of the cell.
      const cellId = `${this.createCellPos(col)}${currentRow}`;
      let cell = null;

      // For null, undefined of blank cell, continue so it doesn't create the createNode
      if (row[i] === null || row[i] === undefined || row[i] === '') {
        if (this.opt.createEmptyCells === true) {
          row[i] = '';
        } else continue;
      }

      const originalContent = row[i];
      row[i] = typeof row[i].trim === 'function' ? row[i].trim() : row[i];

      // Special number formatting options
      for (let j = 0, jen = excelSpecials.length; j < jen; j++) {
        const special = excelSpecials[j];

        // TODO Need to provide the ability for the specials to say
        // if they are returning a string, since at the moment it is
        // assumed to be a number
        if (row[i].match && !row[i].match(/^0\d+/) && row[i].match(special.match)) {
          let val = row[i].replace(/[^\d\.\-]/g, '');

          if (special.fmt) {
            val = special.fmt(val);
          }

          cell = this.createNode(doc, 'c', {
            attr: {
              r: cellId,
              s: special.style,
            },
            children: [this.createNode(doc, 'v', {text: val})],
          });

          break;
        }
      }

      if (!cell) {
        if (
          typeof row[i] === 'number' ||
          (row[i].match && row[i].match(/^-?\d+(\.\d+)?$/) && !row[i].match(/^0\d+/))
        ) {
          // Detect numbers - don't match numbers with leading zeros
          // or a negative anywhere but the start
          cell = this.createNode(doc, 'c', {
            attr: {
              t: 'n',
              r: cellId,
            },
            children: [this.createNode(doc, 'v', {text: row[i]})],
          });
        } else {
          // String output - replace non standard characters for text output
          const text = !originalContent.replace
            ? originalContent
            : originalContent.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

          cell = this.createNode(doc, 'c', {
            attr: {
              t: 'inlineStr',
              r: cellId,
            },
            children: {
              row: this.createNode(doc, 'is', {
                children: {
                  row: this.createNode(doc, 't', {
                    text,
                    attr: {
                      'xml:space': 'preserve',
                    },
                  }),
                },
              }),
            },
          });
        }
      }

      rowNode.appendChild(cell);
    }

    const relsGet = doc.getElementsByTagName('sheetData')[0];
    relsGet.appendChild(rowNode);
  }

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * saveToExcel
   */

  save() {
    if (!this.available()) return false;
    try {
      const self = this;

      this.processing = true;

      const that = this;
      let rowPos = 0;
      const doc = this.getXml('xl/worksheets/sheet1.xml');
      this.doc = doc;

      const xlsx = {
        _rels: {
          '.rels': this.getXml('_rels/.rels'),
        },
        xl: {
          _rels: {
            'workbook.xml.rels': this.getXml('xl/_rels/workbook.xml.rels'),
          },
          'workbook.xml': this.getXml('xl/workbook.xml'),
          'styles.xml': this.getXml('xl/styles.xml'),
          worksheets: {
            'sheet1.xml': doc,
          },
        },
        '[Content_Types].xml': this.getXml('[Content_Types].xml'),
      };

      // Title and top messages
      if (this.opt.title) {
        this.addRow([this.opt.title], rowPos++);
        this.mergeCells(rowPos, this.head.length - 1);
      }

      if (this.opt.messageTop) {
        this.addRow([this.opt.messageTop], rowPos++);
        this.mergeCells(rowPos, this.head.length - 1);
      }

      // Table itself
      // 表头
      if (this.opt.header) {
        this.addRow(this.head, rowPos++);
        $('row:last-child c', doc).attr('s', '2'); // bold
      }

      const dataStartRow = rowPos;

      // 表体
      for (let n = 0, len = this.data.length; n < len; n++) {
        this.addRow(this.data[n], rowPos++, this.opt.hide);
      }

      const dataEndRow = rowPos;

      // 表底
      if (this.opt.footer && this.foot) {
        this.addRow(this.foot, rowPos++);
        $('row:last-child c', doc).attr('s', '2'); // bold
      }

      // Below the table
      if (this.opt.messageBottom) {
        this.addRow([this.opt.messageBottom], rowPos++);
        this.mergeCells(rowPos, this.head.length - 1);
      }

      // Set column widths
      const cols = this.createNode(doc, 'cols');
      // 添加到前面
      $('worksheet', doc).prepend(cols);

      for (let i = 0, ien = this.head.length; i < ien; i++) {
        cols.appendChild(
          this.createNode(doc, 'col', {
            attr: {
              min: i + 1,
              max: i + 1,
              width: this.excelColWidth(i),
              customWidth: 1,
            },
          })
        );
      }

      // Workbook modifications
      const workbook = xlsx.xl['workbook.xml'];

      $('sheets sheet', workbook).attr('name', this.sheetName);

      // Auto filter for columns
      if (this.opt.autoFilter) {
        $('mergeCells', doc).before(
          this.createNode(doc, 'autoFilter', {
            attr: {
              ref: `A${dataStartRow}:${this.createCellPos(this.head.length - 1)}${dataEndRow}`,
            },
          })
        );

        $('definedNames', workbook).append(
          this.createNode(workbook, 'definedName', {
            attr: {
              name: '_xlnm._FilterDatabase',
              localSheetId: '0',
              hidden: 1,
            },
            text: `${this.sheetName}!$A$${dataStartRow}:${this.createCellPos(
              this.head.length - 1
            )}${dataEndRow}`,
          })
        );
      }

      // Let the developer customise the document if they want to
      if (this.opt.customize) {
        this.opt.customize(xlsx, this.opt);
      }

      // Excel doesn't like an empty mergeCells tag
      if ($('mergeCells', doc).children().length === 0) {
        $('mergeCells', doc).remove();
      }

      const zip = new Zip();
      const zipConfig = {
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };

      this.addToZip(zip, xlsx);

      if (zip.generateAsync) {
        // JSZip 3+
        zip.generateAsync(zipConfig).then(function (blob) {
          saveAs(blob, self.opt.fileName);
          self.processing = false;
        });
      } else {
        // JSZip 2.5
        saveAs(zip.generate(zipConfig), self.opt.fileName);
        self.processing = false;
      }
    } catch (e) {
      console.error('excellExport save exp:', e.message);
    }
  }
}
