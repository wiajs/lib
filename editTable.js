/**
 * 在线编辑
 */

import * as tl from './utils/tool';

window.EditTable = class EditTable {
  // 构造函数
  constructor(props) {
    // 当前被编辑的目标对象
    this._editTx = null;
    // 记录键盘被按下的状态，当有键盘按下时其值为true
    this._keyDown = false;

    // 最近的选择行
    this._selRow = null;
    // 当前编辑对象
    this._editCell = null;

    // 最后编辑行
    this._editRow = null;

    // 最后编辑光标位置
    this._editCursorPos = 0;
  }

  static hi(msg) {
    alert(msg);
  }
  /*
   // 异步存储
   set(key, data, expires) {
   _storage.save({
   key: key,   // Note: Do not use underscore("_") in key!
   data: data,
   expires: expires
   });
   }

   // Promise同步方法

   getStore(key) {
      // load
      _storage.load({
        key: key,
        autoSync: true,
        syncInBackground: true
      }).then(data => {
        return data;
    }).catch(err => {
        console.warn(err);
      return null;
    })
    }

    // async 的写法
    async get(key) {
      try {
        let data = await storage.load({
          key: key
        });
        return data;
      }
      catch (err) {
        console.warn(err);
        return null;
      }
    }
  */
  // Chrome、Safari 阻止浏览器的默认事件，实现 全选
  mouseupCell(evt) {
    const ev = evt || window.event;
    ev.preventDefault();
  }

  /**
   * 样式改为编辑状态,支持 input、span,不再支持 textarea
   * @param tx input 或 span 组件
   * @param sel 下拉列表, 下拉选择时，sel 为 true
   */
  editCell(tx, sel) {
    if (tx) {
      // 点击同一网格编辑直接返回
      if (!sel && this._editCell && tx === this._editCell)
        return;

      if (tx.tagName !== 'INPUT' && tx.tagName !== 'SPAN') // || tx.type != "text")
        return;

      // 最后编辑行
      this._editRow = tl.getUpperObj(tx, 'TR');
      // 最后编辑的对象
      this._editTx = tx;

      // 去掉选择行样式为缺省奇偶样式
      if (this._selRow) {
        this.setRowClass(this._selRow, '');
        this._selRow = null;
      }

      if (tx.tagName === 'SPAN') {
        // 替换提示字符
        if (/^~~.+~~$/.exec(tx.innerHTML))
          tx.innerHTML = tx.innerHTML.replace(/^~~.*~~$/, '');

        // tx.scrollIntoView(true);
        // tx.scrollTop = 50;
      } else if (tx.tagName === 'INPUT') {
        tl.setClass(this._editCell, '');
        tl.setClass(tx, 'etCellEdit');

        // input 需全选方便替换!
        if (!sel) {
          tx.focus();
          // 全选
          tx.select();
        }
      }

      // 记录当前正在编辑单元
      this._editCell = tx;
    }
  }

  /**
   * 浏览状态,去掉编辑样式
   * 对于 span,不会触发 onchange 事件,在这里将 span值付给 input,方便向服务器端提交!
   * @param tx
   */
  viewCell(tx) {
    if (!tx)
      return;

    // 下列选项会触发 viewCell
    if (tx.getAttribute('inputing') && tx.getAttribute('inputing') === '1')// 下拉选择时，保持编辑状态
      return;

    // 去掉编辑样式
    if (tx.tagName === 'INPUT')
      tl.setClass(tx, 'etCellView');
    // span的值赋给 input, span无法触发 onchange 事件
    else if (tx.tagName === 'SPAN') {
      const txTo = tl.childTag(tx.parentNode, 'input');

      let val = tx.innerHTML.replace(/^~~.*~~$/, '');
      // 对输入字符进行处理
      val = val.replace(/<br>/g, '\n');
      // val = val.replace(/&gt;/g, '>');
      // val = val.replace(/&lt;/g, '<');
      val = val.replace(/&nbsp;/g, ' ');

      if (!val || /^[\s\n\r]+$/.exec(val)) {
        if (tx.className === 'imgTitle')  // style.textAlign === 'center')
          tx.innerHTML = '~~点这里输入标题~~';
        else
          tx.innerHTML = '~~点这里输入文字~~';

        if (txTo) {
          const img = tl.childTag(txTo.parentNode, 'img');
          if (img) {
            txTo.value = tl.format('![%s](%s)', '', img.getAttribute('src'));
          } else
            txTo.value = '';
        }
      } else if (txTo) {
        // ,号干扰后台数据读取，转换为 \~，后台读取后再转换
        // val = tx.innerHTML.replace(/,/g, '\~');
        const img = tl.childTag(txTo.parentNode, 'img');
        if (img) {
          txTo.value = tl.format('![%s](%s)', val || '', img.getAttribute('src'));
        } else
          txTo.value = val;
      }
    }

    this._editCell = null;
  }

  // 更改 行 样式
  setRowClass(row, className) {
    if (!row)
      return;

    // 恢复原始 样式
    if (className)
      tl.setClass(row, className);
    else {
      tl.setClass(row, '');
/*
      if (row.className.indexOf('Odd') > -1)
        tl.setClass(row, 'etRowOdd');
      else
        tl.setClass(row, 'etRowEven');
*/
    }
  }

  // 对指定 列，设定 只读或非只读，
  readOnly(tb, names, val) {
    try {
      const tbody = tl.tags(tb, 'TBODY')[0];
      const txs = tl.tags(tbody, 'INPUT');
      for (let i = 0; i < txs.length; i++) {
        // 排除  隐藏列
        if (txs[i].type === 'text') {
          txs[i].readOnly = !val;
          for (let j = 0; j < names.length; j++) {
            if (txs[i].name === `tx${names[j]}`)
              txs[i].readOnly = val;
          }
        }
      }
    } catch (e) {
      alert(e.message);
    }
  }

  // 对指定 列，设定隐藏
  hideCol(tb, names) {
    try {
      for (let i = 0; i < names.length; i++) {
        const th = tl.id(`th${names[i]}`);
        if (th) {
          th.style.display = 'none';
        }
      }

      // 在线编辑模版必须 带 tbody，否则工作不正常
      // ??? 为何屏蔽 tbody
      const tbody = tl.tags(tb, 'TBODY')[0];
      const txs = tl.tags(tbody, 'INPUT');
      for (let i = 0; i < txs.length; i++) {
        // 排除  隐藏列
        if (txs[i].type === 'text') {
          for (let j = 0; j < names.length; j++) {
            if (txs[i].name === `tx${names[j]}`) {
              const td = tl.getUpperObj(txs[i], 'TD');
              if (td)
                td.style.display = 'none';
            }
          }
        }
      }
    } catch (e) {
      alert(e.message);
    }
  }

  // 对指定 列，设定显示
  showCol(tb, ns) {
    try {
      for (let i = 0; i < ns.length; i++) {
        const th = tl.id(`th${ns[i]}`);
        if (th) {
          th.style.display = '';
        }
      }

      // 在线编辑模版必须 带 tbody，否则工作不正常
      // ??? 为何屏蔽 tbody
      const tbody = tl.tags(tb, 'TBODY')[0];
      const txs = tl.tags(tbody, 'INPUT');
      for (let i = 0; i < txs.length; i++) {
        // 排除  隐藏列
        if (txs[i].type === 'text') {
          for (let j = 0; j < ns.length; j++) {
            if (txs[i].name === `tx${ns[j]}`) {
              const td = tl.getUpperObj(txs[i], 'TD');
              if (td)
                td.style.display = '';
            }
          }
        }
      }
    } catch (e) {
      alert(e.message);
    }
  }

  lightonRow(row) {
    const r = tl.getUpperObj(row, 'TR');
    if (!r || r === this._selRow)
      return;

    // 当前点击行高亮度显示
    if (r.className.indexOf('Odd') > -1)
      this.setRowClass(r, 'etRowSelOdd');
    else
      this.setRowClass(r, 'etRowSelEven');

    // 将所有未被选中的行取消高亮度现实
    this.setRowClass(this._selRow, '');
    this._selRow = r;
  }

  // 指定表的指定列，指定数据删除
  deleteData(tb, name, val) {
    const txs = document.getElementsByName(name);
    for (let i = 1; i < txs.length; i++) {
      if (txs[i].value === val) {
        this.deleteRow(tb, i);
        i--;
      }
    }
  }

  /**
   * 行选择,点击选择当前行,便于删除行
   * 支持Checkbox 多选行，用于批量行操作
   * @param obj
   */
  selRow(obj, ev) {
    if (!obj)
      return;

    // if ( ev )
    //  ev.preventDefault();

    const row = tl.getUpperObj(obj, 'TR');
    if (row) {
      if (obj.tagName === 'TD') {
        if (row !== this._selRow)
          this._selRow = row;
      } else {
        const tbody = tl.getUpperObj(row, 'TBODY');
        const tb = tbody.parentNode;
        const th = tl.tags(tb, 'TH')[0];

        if (tl.lastChild(tl.firstChild(row)).value) {
          tl.lastChild(th).value = tl.lastChild(th).value ? `${tl.lastChild(th).value},` : '';
          if (obj.checked)
            tl.lastChild(th).value += tl.lastChild(tl.firstChild(row)).value;
          else
            tl.lastChild(th).value = tl.lastChild(th).value.replace(
              `${tl.lastChild(tl.firstChild(row)).value},`, '');
        }
      }
    }
  }

  /**
   * 删除选择或最后编辑行，或当前行，一次只能删除一行
   * @param tb
   * @param iRow 指定的行数
   * 返回 剩下的行数
   */
  deleteRow(tb, iRow) {
    let rs = 0;

    if (!tb)
      return 0;

    try {
      const tbody = tl.tags(tb, 'TBODY')[0];
      const rows = tl.tags(tbody, 'TR');

      if (rows.length === 0)
        return;

      let delRow = null;

      if (tb && iRow)
        delRow = tb.rows[iRow + 1];
      else // 删除选择行
        delRow = this._selRow;

      // 没有选择行,直接删除最后编辑行
      if (!delRow && this._editRow) {
        delRow = this._editRow;
        // x('txInfo').value = 'this._editRow';
      }

      if (!delRow)
        delRow = rows[rows.length - 1];

      if (!delRow)
        return;

      if (this._selRow) {
        this.setRowClass(this._selRow, '');
        this._selRow = null;
      }

      if (this._editCell) {
        tl.setClass(this._editCell, '');
        this._editCell = null;
      }

      const th = tl.tags(tb, 'TH')[0];

      if (delRow.childElementCount > 0 && tl.lastChild(tl.firstChild(delRow)).value) { // 记录删除ID
        tl.lastChild(th).value = tl.lastChild(th).value ? `${tl.lastChild(th).value},` : '';
        tl.lastChild(th).value += tl.lastChild(tl.firstChild(delRow)).value;
      }
      // alert( tl.lastChild(tl.firstChild(delRow)).value );

      if (delRow === this._selRow)
        this._selRow = null;

      if (delRow === this._editRow) {
        this._editRow = null;
        this._editTx = null;
      }

      let preRow = delRow.previousSibling;
      let span = tl.tags(delRow, 'span')[0];
      if (delRow.parentNode)
        delRow.parentNode.removeChild(delRow);

      // span 全屏编辑,没有数据,自动增加一行
      if (span) {
        // 返回剩下行数
        rs = tl.tags(tbody, 'TR').length;
        if (!rs) {
          preRow = this.addRow(tb, '~~点这里输入文字~~');
          rs = 1;
        }

        if (preRow) {
          span = tl.tags(preRow, 'span')[0];
          if (span)
            tl.cursorEnd(span);
        }
      }

      // 对tr重新排序，排除 文本节点干扰,移动端不需要,屏蔽!!!???
      /*
       var i = 0;
       for(var j = 0; j < tbody.childNodes.length; j++) {
       var row = tbody.childNodes[j];
       if(row.nodeType == 1) {
       i++;
       tl.firstChild(tl.firstChild(row)).nodeValue = i; //innerHTML = i+1; 不能使用 innerHTML，里面有隐藏 Field，存放 ID
       // 更改交替样式
       if(i % 2 == 1)
       setRowClass(row, "etRowOdd");
       else
       setRowClass(row, 'etRowEven');
       }
       }
       */
    } catch (e) {
      console.error(`deleteRow exp:${e.message}`);
    }

    return rs;
  }

  /**
   * 在最后添加一行
   * @param tb
   * @param txt
   * @param node
   * @returns {Node}
   */
  addRow(tb, txt, node) {
    const thead = tl.tags(tb, 'THEAD')[0];
    let row = tl.lastChild(thead).cloneNode(true);

    const span = tl.tags(row, 'span')[0];
    if (span)
      span.innerHTML = txt || '';

/*
    const tx = tl.tags(row, 'INPUT')[0];
    if (tx)
      tx.value = txt || '';
*/

    row.style.display = '';

    const tbody = tl.tags(thead.parentNode, 'TBODY')[0];
    /* 移动无需 奇偶样式!!!???
     var cnt = tl.childCount(tbody);
     tl.firstChild(tl.firstChild(row)).nodeValue = cnt + 1;
     if ( cnt % 2 == 1)
     setRowClass( row, 'etRowEven' );
     */
    row = tbody.insertBefore(row, node || null);

    this._editRow = row;
    this._editTx = tl.tags(row, 'span') || tl.tags(row, 'input');
    if (this._editTx)
      this._editTx = this._editTx[0];
    this._selRow = row;
    this._editCell = null;
    // ???
    // x('txInfo').value = 'addRow';

    return row;
  }

  clearRow(tb) {
    if (!tb) {
      alert('请传入table对象！');
      return;
    }

    const tbody = tl.tags(tb, 'TBODY')[0];
    while (tbody.childNodes.length > 0)
      tbody.removeChild(tbody.childNodes[0]); // 需测试！
    // updated by dwzhao 2011/05/15
    // $(tbody).empty();
  }

  /**
   * 计算空行数，第一列为序号，第二列为空，作为空行
   * @param obj
   * @returns {*}
   */
  getNullRow(obj) {
    let rs = {row: null, cnt: 0};

    let nullRow = null;
    let nullCnt = 0;
    for (let i = 0; i < obj.childNodes.length; i++) {
      const nd = obj.childNodes[i];
      let val = '';
      try {
        // 第二列,不管第一列,如果去掉第一列,需修改当前代码!!!
        const tx = tl.firstChild(nd.cells[1]);
        if (tx.tagName === 'IMG')
          val = 'img';
        else if (tx.tagName === 'SPAN')
          val = tl.trim(tx.innerHTML);
        else if (tx.tagName === 'INPUT')
          val = tl.trim(tx.value);
        else
          val = tl.trim(tx.nodeValue);
      } catch (e) {
        console.error(`getNullRow exp:${e.message}`);
      }

      if (nd.nodeType === 1 && !val) {
        nullCnt++;
        if (!nullRow)
          nullRow = nd;
      }
    }

    if (nullRow)
      rs = {row: nullRow, cnt: nullCnt};

    return rs;
  }

  setIdx(txs, names) {
    // 对 Input 添加 索引，方便操作
    for (let i = 0; i < txs.length; i++) {
      txs[i].setAttribute('idx', '');
      // 与名称对应上
      for (let j = 0; j < names.length; j++) {
        if (txs[i].tagName === 'INPUT') {
          if (txs[i].name === `tx${names[j]}`)
            txs[i].setAttribute('idx', j);
        } else {
          if (txs[i].getAttribute('name') === `tx${names[j]}`)
            txs[i].setAttribute('idx', j);
        }
      }
    }
  }

  /**
   * 设置值,以input为基准,可以带 span
   * @param txs
   * @param values
   * @returns {*}
   */
  setVal(txs, values) {
    // 列赋值
    for (let j = 0; j < txs.length; j++) {
      let idx = txs[j].getAttribute('idx');
      if (idx === null || tl.trim(idx) === '' || isNaN(idx))
        continue;

      idx = Number(idx);
      if ((values[idx] || values[idx] === 0)) {
        const tx = txs[j];
        let val = values[idx];

        // 浏览状态
        if (tx.tagName === 'SPAN') {
          // 图片
          let rgs = /!\[(.*)]\s*\((.+)\)/.exec(val);
          if (rgs) {
            // 图片赋值
            const img = document.createElement('img');
            img.src = rgs[2];
            tl.setClass(img, 'etImg');
            tx.parentNode.insertBefore(img, tx.parentNode.childNodes[0]);
            tx.innerHTML = rgs[1] || '';
            // sp.placeholder = '点这里输入标题';
            tl.setClass(tx, 'imgTitle');
          } else {
            const v = `;${val};`;
            rgs = /;value=([^;]*);/.exec(v);
            if (rgs)
              tx.innerHTML = rgs[1] || '';
            else {
              rgs = /^~~(.*)~~/.exec(val);
              // 提示符 ~~请输入价格~~
              if (rgs) {
                tx.innerHTML = '';
              } else
                tx.innerHTML = val;
            }
/*
            rgs = /^~~(.*)~~$/.exec(val);
            // 提示符 ~~请输入价格~~
            if (rgs) {
              tx.innerHTML = '';
            } else {
              rgs = /^\*{2,}([^\*]+)\*{2,}$/.exec(val);
              if (rgs)  // 后面的值必填 ***价格***
                tx.innerHTML = rgs[1];
              else
                tx.innerHTML = val;
            }
*/
          }
          // 回车换行
          tx.innerHTML = tx.innerHTML.replace(/\r\n/g, '\n').replace(/[\r\n]/g, '<br>');
          tx.style.webkitUserModify = 'read-only';
        } else { // 编辑状态, Span 同步赋值,如使用 span显示,input提交,input是隐藏的!
          const sp = tl.childTag(tx.parentNode, 'span');
          if (tx.type === 'hidden' && sp) {
            tx.value = val;
            val = tx.value.replace(/\r\n/g, '\n').replace(/[\r\n]/g, '<br>');

            // 图片
            const rgs = /!\[(.*)]\s*\((.+)\)/.exec(val);
            if (rgs) {
              // 图片赋值
              const img = document.createElement('img');
              img.src = rgs[2];
              tl.setClass(img, 'etImg');
              tx.parentNode.insertBefore(img, tx.parentNode.childNodes[0]);
              sp.innerHTML = rgs[1] || '~~点这里输入标题~~';
              // sp.placeholder = '点这里输入标题';
              tl.setClass(sp, 'imgTitle');
            } else
              sp.innerHTML = val;
          } else {
            const v = `;${val};`;
            let rgs = /;type=([^;]+);/.exec(v);
            if (rgs)
              tx.type = rgs[1];
            rgs = /;pattern=([^;]+);/.exec(v);
            if (rgs)
              tx.pattern = rgs[1];
            rgs = /;placeholder=([^;]+);/.exec(v);
            if (rgs)
              tx.placeholder = rgs[1];
            rgs = /;readonly=([^;]+);/.exec(v);
            if (rgs)
              tx.setAttribute('readonly', 'readonly');
              // tx.readonly = rgs[1];
            rgs = /;value=([^;]*);/.exec(v);
            if (rgs)
              tx.value = rgs[1] || '';
            else
              tx.value = val;

            /*
            let rgs = /^~~type=(\w+);(.*)~~$|^~~(.*)~~$/.exec(val);
            // let rgs = /^~~(.*)~~$/.exec(val);
            // 提示符 ~~请输入价格~~
            if (rgs) {
              if (rgs[1]) {
                tx.type = rgs[1];
                if (tx.type === 'number')
                  tx.pattern = '[0-9]*';
                tx.placeholder = rgs[2];
              } else if (rgs[3])
                tx.placeholder = rgs[3];
              tx.value = '';
            } else {
              rgs = /^\*\*\*([^\*]*)\*\*\*$/.exec(val);
              if (rgs) { // 后面的值必填 ***价格***
                tx.value = `*${rgs[1]}`;
                tx.setAttribute('readonly', 'readonly');
                // tx.style.color = 'red';
              } else {
                rgs = /^\*\*([^\*]*)\*\*$/.exec(val);
                if (rgs) { // 只读 **价格**
                  tx.value = rgs[1];
                  tx.setAttribute('readonly', 'readonly');
                } else {
                  if ((typeof val) === 'number') {
                    tx.type = 'number';
                    tx.pattern = '[0-9]*';
                  }
                  tx.value = val;
                }
              }
            }
            */
          }
        }
      }
    }
  }

  /**
   * 添加一个实例数据行到空行之前, 返回 添加的行数
   * textarea 实现高度自动适配很麻烦,去掉支持!
   * span 可直接编辑!
   * @param tb 表
   * @param names 字段名称
   * @param values 值
   * @param node 插入到指定的行前
   * @returns {number}
   */
  addData(tb, names, values, node) {
    let RC = 0;
    try {
      const thead = tl.tags(tb, 'THEAD')[0];
      const tbody = tl.tags(tb, 'TBODY')[0];
      // 行模板
      const rowPat = tl.lastChild(thead);
      let view = false;
      let txs = tl.tags(rowPat, 'INPUT');
      if (!txs || txs.length === 0) {
        view = true;
        txs = tl.tags(rowPat, 'SPAN');
      }

      // 对 Input 添加 索引，方便操作
      if (txs && txs.length > 0)
        this.setIdx(txs, names);

      let row = null;
      // 行赋值
      for (let i = 0; i < values.length; i++) {
        // 拷贝 模板行
        row = rowPat.cloneNode(true);
        row.style.display = '';

        if (view)
          txs = tl.tags(row, 'SPAN');
        else
          txs = tl.tags(row, 'INPUT');

        // 列赋值
        if (txs && txs.length > 0)
          this.setVal(txs, values[i]);

        // 计算空行数，第一列为序号，第二列为空，作为空行,dwz 为何无此部分？
        // if (node)
        const nullRow = this.getNullRow(tbody);

        const cnt = tl.childCount(tbody);
        tl.firstChild(tl.firstChild(row)).nodeValue = cnt - nullRow.cnt + 1;

        if ((cnt - nullRow.cnt) % 2 === 1)
          this.setRowClass(row, 'etRowEven');

        // 插入到空行前
        if (nullRow.row)
          tbody.insertBefore(row, nullRow.row);
        else
          tbody.insertBefore(row, null);

        RC = i + 1;
      } // for

      /* 移动端无需排序!!!???
       // 对空行重新排序，设置样式
       if (nullRow.cnt > 0) {
       // 对tr重新排序，排除 文本节点干扰
       var i = 0;
       for (var j = 0; j < tbody.childNodes.length; j++) {
       row = tbody.childNodes[j];
       if (row.nodeType == 1) {
       i++;
       tl.firstChild(tl.firstChild(row)).nodeValue = i; //innerHTML = i+1; 不能使用 innerHTML，里面有隐藏 Field，存放 ID
       // 更改交替样式
       if (i % 2 == 1)
       setRowClass(row, "etRowOdd");
       else
       setRowClass(row, 'etRowEven');

       //alert( tl.firstChild(tl.firstChild(row)).nodeValue  + " " + row.className );
       }
       }
       }
       */
    } catch (e) {
      alert(`addData exp:${e.message}`);
    }

    return RC;
  }

  /**
   * 插入文本节点
   * @param tb
   * @param txt
   * @returns {*}
   */
  addTxt(tb, txt) {
    let RC = null;
    try {
      const thead = tl.tags(tb, 'THEAD')[0];
      const tbody = tl.tags(tb, 'TBODY')[0];
      // 行模板
      const rowPat = tl.lastChild(thead);

      // 拷贝 模板行
      let row = rowPat.cloneNode(true);
      row.style.display = '';

      const tx = tl.tags(row, 'INPUT')[1];
      // alert( tx.parentNode.tagName)
      // 列赋值
      tx.value = txt;

      // Span 同步赋值
      const sp = tl.childTag(tx.parentNode, 'span');
      sp.innerHTML = txt;

      // 插入到当前行
      row = tbody.insertBefore(row, this._editRow);
      this._editRow = row;
      this._editTx = tl.tags(row, 'span') || tl.tags(row, 'input');
      if (this._editTx)
        this._editTx = this._editTx[0];

      this._selRow = row;
      this._editCell = null;

      RC = row;
    } catch (e) {
      alert(`addTxt exp:${e.message}`);
    }
    return RC;
  }

  /**
   * 添加一个图片数据行到当前编辑行之前, 返回添加的行对象
   * @param tb
   * @param row
   * @param src
   * @returns 新添加的行
   */
  addImg(tb, src, title) {
    let RC = null;
    try {
      const thead = tl.tags(tb, 'THEAD')[0];
      const tbody = tl.tags(tb, 'TBODY')[0];
      // 行模板
      const rowPat = tl.lastChild(thead);

      // 拷贝 模板行
      let row = rowPat.cloneNode(true);
      row.style.display = '';

      const tx = tl.tags(row, 'INPUT')[1];
      // alert( tx.parentNode.tagName)
      // 列赋值,参照 md语法 ![alt](url)
      tx.value = tl.format('![%s](%s)', title || '', src); // JSON.stringify({title:'',url:url});

      // Span 同步赋值
      const sp = tl.childTag(tx.parentNode, 'span');
      sp.innerHTML = title || '~~点这里输入标题~~';
      tl.setClass(sp, 'imgTitle');

      // 图片赋值
      const img = document.createElement('img');
      img.src = src;
      tl.setClass(img, 'etImg');
      tx.parentNode.insertBefore(img, tx.parentNode.childNodes[0]);

      let cur = this._selRow || this._editRow;
      // 添加到当前行后面
      cur = cur && cur.nextSibling;
      row = tbody.insertBefore(row, cur);
      this._editRow = row;
      this._editTx = tl.tags(row, 'span') || tl.tags(row, 'input');
      if (this._editTx)
        this._editTx = this._editTx[0];

      this._selRow = row;
      this._editCell = null;

      RC = row;

      // 如果是最后行,则自动增加空行!
      if (!cur)
        this.addRow(tb, '~~点这里输入文字~~');
      else {
        const span = tl.tags(cur, 'span')[0];
        if (span) {
          const val = span.innerHTML;
          if (!val || /^[\s\n\r]+$/.exec(val))
            span.innerHTML = '~~点这里输入文字~~';
        }
      }
      this._editTx.focus();
    } catch (e) {
      alert(`addImg exp:${e.message}`);
    }

    return RC;
  }

  /**
   * 获取当前对象坐标
   * @param obj
   * @returns {{x: number, y: number}}
   */
  getPosition(obj) {
    let left = obj.offsetLeft;
    let top = obj.offsetTop;

    let op = obj.offsetParent;
    while (op) {
      left += obj.offsetLeft;
      top += obj.offsetTop;
      op = obj.offsetParent;
    }

    return {
      x: left,
      y: top
    };
  }

  mouseOver(evt) {
    const ev = evt || window.event;
    const elm = ev.srcElement || ev.target;
    tl.setClass(elm, 'etCellSelMouseOver');
  }

  mouseOut(evt) {
    const ev = evt || window.event;
    const elm = ev.srcElement ? ev.srcElement : ev.target;
    tl.setClass(elm, 'etCellSel');
  }

  editMouseup(evt) {
    const ev = evt || window.event;
    ev.preventDefault();
  }

  /**
   * 显示输入编辑框,或下拉列表
   * @param tx 编辑对象
   * @param inp 输入框
   */
  showInput(to, inp) {
    // debugger;
    let tx = to;
    if (inp.getAttribute('show') && inp.getAttribute('show') === '1') {
      return;
    }

    console.log('showInput:%s', tx.tagName);

    // 设置显示标记
    inp.setAttribute('show', '1');

    if (tx && tx.tagName === 'TD')
      tx = tl.childTag(tx, 'span');

    // 判断是否正在编辑标记,避免循环调用
    /*
     if(tx.getAttribute('inputing') && tx.getAttribute('inputing') == '0') {
     tx.setAttribute('inputing', "1");
     return;
     }
     */

    // 设置正在编辑标记
    tx.setAttribute('inputing', '1');

    // 进入编辑状态
    this.editCell(tx, inp);

    // 如果是多行文本编辑,则插入编辑器,编辑器实现了自适应高度
    if (inp.tagName === 'TEXTAREA') {
      let h = tx.offsetHeight;
      if (h < tx.parentNode.offsetHeight)
        h = tx.parentNode.offsetHeight;

      inp.style.height = `${h}px`;
      inp.style.minHeight = `${h}px`;
      // inp.style.display = '';
      // console.log( 'showInput td.style.height:' + tx.parentNode.style.height
      //  + ' td.offsetHeight:' + tx.offsetHeight );
      tx.parentNode.insertBefore(inp, tx);
      tx.style.display = 'none';
    } else { // 对 div 操作,调整下拉列表位置
      const pos = this.getPosition(tx);
      const pd = inp.parentNode;
      // alert( pos.x, pos.y);
      // var pos = getPosition(tx);
      pd.style.top = `${(tx.tagName === 'SPAN' ? pos.y : pos.y + tx.offsetHeight + 2)}px`;
      pd.style.left = `${pos.x}px`;
      pd.style.width = `${(tx.tagName === 'SPAN' ? tx.offsetWidth : tx.offsetWidth + 2)}px`;
      pd.style.display = '';
      // style.display = "block";
      pd.style.height = `${(tx.tagName === 'SPAN' ? tx.offsetHeight : tx.style.height)}px`;
    }

    // 显示控件的值传给输入框!
    let val = tx.tagName === 'SPAN' ? tx.innerHTML : tx.value;
    if (/^\*\*请/.exec(val))
      inp.value = '';
    // 赋值给 输入框,特殊字符需转义
    else {
      val = val.replace(/<br>/g, '\n');
      val = val.replace(/&gt;/g, '>');
      val = val.replace(/&lt;/g, '<');
      val = val.replace(/&nbsp;/g, ' ');
      inp.value = `${val}\n`;
    }

    // 跟随原样式
    inp.style.textAlign = tx.style.textAlign;
    inp.style.fontSize = tx.style.fontSize;

    // ???
    // if(tx.tagName == 'SPAN')
    //  inp.style.height = (tx.offsetHeight + 20) + 'px';

    // ??? dwzhao +++
    inp.style.zIndex = '1000';
    // 切换焦点到 Input，便于使用按键，失去焦点时，实现自动隐藏
    inp.focus();
  }

  /**
   * 隐藏输入编辑器或下拉列表
   * input onblur 不能触发该事件，点击 Select，会触发 onBlur，导致 Select 隐藏，失去整个页面焦点
   * @param obj 编辑器
   * @param div 编辑器的层
   */
  hideInput(obj, div) {
    // 结束编辑
    if (obj)
      obj.setAttribute('show', '0');

    if (obj.tagName === 'TEXTAREA') {
      // 保存最后编辑的光标位置,用于插入图片
      this._editCursorPos = this.getCursorPos(obj);

      this._editTx.style.display = '';
      this._editTx.parentNode.removeChild(obj);
      if (div)
        div.appendChild(obj);
    } else
      obj.parentNode.style.display = 'none';

    return true;
  }

  /**
   * 将输入框的内容赋值给现实对象
   * @param objTo
   * @param objShow
   */
  changeInput(objShow) {
    // 同时对 span 及 隐藏 input 赋值！
    if (objShow) {
      const tx = objShow.value;
      if (this._editTx.tagName === 'SPAN') {
        let val = tx.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        val = val.replace(/\r\n/g, '\n').replace(/[\r\n]/g, '<br>').replace(/\s/g, '&nbsp;');
        val = val.replace(/\s+$/, '');
        this._editTx.innerHTML = val;
        // 同时赋值给 input组件,便于提交（span无法提交）
        const txTo = tl.childTag(this._editTx.parentNode, 'input');
        if (txTo)
          txTo.value = tx;
      } else
        this._editTx.value = tx;
    } else {
      const txTo = tl.childTag(this._editTx.parentNode, 'input');
      if (txTo)
        txTo.value = this._editTx.value;
    }
  }

  // 回车、鼠标点击，直接输入
  setInput(objTo, objShow) {
    if (objTo.tagName === 'SPAN') {
      objTo.innerHTML = objShow.value;
      const txs = tl.tags(objTo.parentNode, 'INPUT');
      if (txs)
        txs[0].value = objShow.value;

      objShow.parentNode.style.display = 'none';
      // 避免 切换焦点时，下拉列表 重复显示
      objTo.setAttribute('inputing', '0');
    } else {
      objTo.value = objShow.value;
      objShow.parentNode.style.display = 'none';
      // 避免 切换焦点时，下拉列表 重复显示
      objTo.setAttribute('inputing', '0');
      objTo.focus();
      objTo.select();
    }
  }

  // 将全部复选框设为指定值
  setOnlineEditCheckBox(obj, value) {
    const tbody = tl.tags(obj, 'TBODY')[0];
    for (let i = tbody.childNodes.length - 1; i >= 0; i--)
      tbody.childNodes[i].firstChild.firstChild.checked = value;
  }

  /**
   * 列隐藏，cellIndex2种浏览器返回不同的列序号
   * 在ie6/7 下点击3号这列，显示 "2"
   * 在firefox3 下点击， 显示 "3"
   * @param td
   * @returns {number}
   */
  getCellIndex(td) {
    let RC = -1; // 没找到

    if (!td)
      return -1;

    const tds = td.parentNode.childNodes;
    for (let i = 0; i < tds.length; i++) {
      const nd = tds[i];

      // 只计算 td，包括 隐藏列
      if (nd.nodeName.toUpperCase() === 'TD') { // 元素节点
        // 开始计数
        if (RC === -1)
          RC = 0;

        if (td === nd)
          break;

        RC++;
      }
    }

    return RC;
  }

  // 设置键盘状态，即bKeyDown的值
  setKeyDown(status) {
    this._keyDown = status;
  }

  /**
   * 处理按键事件,改变按键行为
   * @param ev
   */
  keyDown(evt) {
    const ev = evt || window.event;
    const el = ev.srcElement || ev.target;
    const key = ev.keyCode || ev.which || ev.charCode;
    const DEL = 8;
    const RETURN = 13;
    const TAB = 9;

    // 图片标题回车自动增加行
    if (el.tagName === 'SPAN') {
      if (key === RETURN && el.className === 'imgTitle') { // el.style.textAlign === 'center') {
        // ev.stopPropagation && ev.stopPropagation();
        // ev.cancelBubble=true;
        // ev.keyCode = 0;
        // ev.returnvalue=false;

        // x('txInfo').value = key;

        const td = el.parentNode;
        const tr = td.parentNode;
        const tb = tl.getUpperObj(tr, 'TABLE');

        const nextRow = tr.nextSibling;
        if (!nextRow || tl.tags(nextRow, 'img').length > 0) {
          // var row = addRow(tb, '');
          const row = this.addRow(tb, '', nextRow);
          tl.tags(row, 'span')[0].focus();
        } else if (nextRow) {
          const span = tl.tags(nextRow, 'span')[0];
          if (span)
            tl.cursorEnd(span);
        }
        ev.preventDefault();
      } else if (key === DEL && el.tagName === 'SPAN') {
        if (!el.innerHTML || /(^(<br>)*$)|(^(\s)*$)/.exec(el.innerHTML)) {
          // x('txInfo').value = 'deleteRow';
          const tb = tl.getUpperObj(el, 'TABLE');
          this.deleteRow(tb);
          ev.preventDefault();
        }
      }
    }
  }

  /**
   * 被 textarea、select 下拉列表调用，用于回车 选择列表项，注意，页面 函数需增加 event 参数！
   * event 参数放到第一个参数
   * @param ev
   * @param objTo
   * @param objShow
   */
  keyPress(evt, objTo, objShow) {
    // var key = (window.event) ? window.event.keyCode : ev.keyCode;
    const ev = evt || window.event;
    const key = ev.keyCode;
    const el = ev.srcElement || ev.target;
    // set responses to keydown events in the field
    // this allows the user to use the arrow keys to scroll through the results
    // ESCAPE clears the list
    // TAB sets the current highlighted value
    //
    const RETURN = 13;
    const TAB = 9;
    const ESC = 27;

    // 删除
    if (el.tagName === 'SPAN') {
      const tb = tl.getUpperObj(el, 'TABLE');
      if (key === RETURN && el.className === 'imgTitle') { // style.textAlign === 'center') {
        if (ev.stopPropagation)
          ev.stopPropagation();
        ev.cancelBubble = true;
        ev.keyCode = 0;
        ev.returnvalue = false;
        this.addRow(tb, '~~点这里输入文字~~');
      }
    }

    return false;

/*
    switch (key) {
      case RETURN:
        setInput(objTo, objShow);
        ev.keyCode = 0;
        if (window.event) {
          ev.cancelBubble = true;     // ie下阻止冒泡
          ev.returnValue = false;
        } else {
          //evt.preventDefault();
          ev.stopPropagation();     // 其它浏览器下阻止冒泡
        }

        break;

      case ESC:
        hideInput(objShow);
        break;
    }
*/
  }

  // 为动态表格增加键盘导航功能,要使用该功能请在表格定义中增加事件处理
  // table 需增加 tabIndex="-1"，否则无法接收按键事件
  // onKeyDown="navigateKeys(event)" onKeyUp="setKeyDown(false)"
  // 有一点点问题，当按下"->"跳转到下一输入域时，光标显示在第一个字符之后
  // 建议仍然使用Tab键跳转
  navigateKeys(evt) {
    // 长按时，是否连续移动
    // if (this._keyDown)
    //  return;

    // bKeyDown = true;
    const ev = evt || window.event;
    const elm = ev.srcElement || ev.target;
    let key = ev.keyCode || ev.which || ev.charCode;

    if (elm.tagName !== 'INPUT' && elm.tagName !== 'SPAN') {
      // 删除
      if (key === 46 && this._selRow)
        this.deleteRow();

      // 默认只对INPUT进行导航，可自行设定
      return;
    }

    const td = elm.parentNode;
    const tr = td.parentNode;
    const ty = tr.parentNode;  // TBody
    const tb = ty.parentNode;

    let nRow = tr.rowIndex;
    let nCell = this.getCellIndex(td); // td.cellIndex; // 隐藏列 ie 返回 值错误

    switch (key) {
      case 37:
        // <-
        // if (getCursorPosition(elm)>0)
        //  return;
        if (this.getCursorPos(elm) > 0)
          return;

        nCell--;

        // 跳过隐藏TD
        while (tb.rows[nRow].cells[nCell].style.display === 'none') {
          if (nCell > 0)
            nCell--;
        }

        if (nCell === 0) {
          // 跳转到上一行
          nRow--;
          // 最后一列
          nCell = tr.cells.length - 1;
        }
        key = 0;
        break;

      case 38:
        // ^
        nRow--;
        // 跳过隐藏TD
        while (tb.rows[nRow].cells[nCell].style.display === 'none') {
          if (nRow !== 0)
            nRow--;
        }

        key = 0;
        break;

      case 39:
        // ->
        // if (getCursorPosition(elm)<elm.value.length)
        //  return;
        if (this.getCursorPos(elm) < elm.value.length)
          return;

        nCell++;
        // 跳过隐藏TD
        while (tb.rows[nRow].cells[nCell].style.display === 'none') {
          if (nCell !== 0)
            nCell++;
        }

        if (nCell >= tr.cells.length) {
          // 跳转到下一行首位置
          nRow++;
          // 第一列一般是序号，无法选择
          nCell = 2;
          // var tx = tl.firstChild(tb.rows[nRow].cells[nCell]);
          // if ( tx.tagName != 'INPUT' )
          //	nCell = 2;
        }
        key = 0;
        break;

      case 40:
        // \|/
        nRow++;
        // 跳过隐藏TD
        while (nRow < tb.rows.length && tb.rows[nRow].cells[nCell].style.display === 'none') {
          if (nRow < tb.rows.length)
            nRow++;
        }

        if (nRow >= tb.rows.length) {
          nRow = tb.rows.length;
          // 增加一个空行
          this.addRow(tb);
          // nCell=1;//跳转到第一列
        }
        key = 0;
        break;

      case 13:
        // Enter
        // event.keyCode = 9;
        /* nCell++;
         if(nCell==objTR.cells.length){
         nRow++;//跳转到下一行首位置
         nCell=1;//第一列
         }

         if(nRow==objTBODY.rows.length){
         addRow(objTable);//增加一个空行
         nCell=1;//跳转到第一列
         }
         */
        break;

      default:
        // do nothing
        return;
    }

    if (key === 0) {
      // evt.keyCode||evt.which||evt.charCode;
      ev.keyCode = 0;
      if (window.event) {
        ev.cancelBubble = true;     // ie下阻止冒泡
        ev.returnValue = false;
      } else {
        // evt.preventDefault();
        ev.stopPropagation();     // 其它浏览器下阻止冒泡
      }
    }

    // 第一行为 隐藏模版行
    if (nRow < 2 || nRow >= tb.rows.length || nCell < 1 || nCell >= tr.cells.length)
      return;

    // alert( nRow + ':' + nCell );
    // tr = ty.rows[nRow];
    // td = tr.cells[nCell];
    const tx = tl.firstChild(tb.rows[nRow].cells[nCell]);
    // tx.focus();
    // tx.select();
    this.editCell(tx);
  }

  /**
   * 获取光标位置之前的所有文本后删除
   * 光标详细讲解: http://blog.csdn.net/fudesign2008/article/details/7568263
   * @param to 剪切对象，如没有则自动查找最后编辑对象
   * @returns {string} 返回剪切的文本
   */
  cutTxt(to) {
    let rs = '';

    let tx = to;
    if (!tx && this._editTx)
      tx = this._editTx;

    if (!tx)
      return '';

    if (window.getSelection()) {
      // dom range
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const rg = sel.getRangeAt(0);
        const cur = rg.startContainer;
        const pos = rg.startOffset;
        const dels = [];
        for (let i = 0; i < tx.childNodes.length; i++) {
          const nd = tx.childNodes[i];
          if (cur === nd) {
            // 文本节点
            if (nd.nodeType === 3) {
              rs += nd.nodeValue.substr(0, pos);
              nd.nodeValue = nd.nodeValue.substr(pos);
            } else {
              rs += nd.innerHTML.substr(0, pos);
              nd.innerHTML = nd.innerHTML.substr(pos);
            }
            break;
          }

          if (tx.childNodes.length > 1) {
            rs += nd.nodeType === 3 ? nd.nodeValue : nd.outerHTML;
            dels.push(nd);
          }
        }

        // 删除已经返回的节点
        for (let i = 0; i < dels.length; i++) {
          tx.removeChild(dels[i]);
        }
      }
    }
    return rs;
  }
};

export default window.EditTable;
