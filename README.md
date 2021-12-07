English | [Chinese](./README.CN.md)

# Wia Libs

Libs for [wia](https://www.wia.pub) applications.

See [wia components](https://www.wia.pub/doc/lib.html) documentation for detailed description.

## install

You will need Node.js installed on your system.

Install

```bash
$ npm install @wiajs/component
```

## To use

Excel Export

```js
import ExcelExport from '@wiajs/lib/excelExport';

_.name('btnExcel').click(ev => {
  const head = [
    '������ˮ',
    '���˽��',
    '����ʱ��',
    '��������',
    '�����˺�',
    'ժҪ',
  ];
  const excel = new ExcelExport(head, _data, {
    title: `${txStartDate.val()}��${$.date(
      'MM-dd',
      txEndDate.val()
    )} �ͻ������`,
    fileName: `�ͻ�����v${$.date('yyMMdd')}`,
  });
  excel.save();
});
```
