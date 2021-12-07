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
    '银行流水',
    '入账金额',
    '入账时间',
    '入账名称',
    '入账账号',
    '摘要',
  ];
  const excel = new ExcelExport(head, _data, {
    title: `${txStartDate.val()}至${$.date(
      'MM-dd',
      txEndDate.val()
    )} 客户结算表`,
    fileName: `客户结算v${$.date('yyMMdd')}`,
  });
  excel.save();
});
```
