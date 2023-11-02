Chinese | [English](./README.md)

# Wia 库

创建[wia](https://www.wia.pub) 应用的功能库。

功能库与组件不同，库不含UI，纯代码库，组件含UI部分。

将纯代码库与组件分离开，方便使用。

详细信息请参建 [wia components](https://www.wia.pub/doc/lib.html)。

## 安装

需 Node.js 环境。

安装 wia 库

```bash
$ npm install @wiajs/lib
```

## 使用

比如 页面Excel导出。

```js
import ExcelExport from '@wiajs/lib/excelExport';

  _.name('btnExcel').click(ev => {
    const head = ['银行流水', '入账金额', '入账时间', '入账名称', '入账账号', '摘要'];
    const excel = new ExcelExport(head, _data, {
      title: `${txStartDate.val()}至${$.date('MM-dd', txEndDate.val())} 客户结算表`,
      fileName: `客户结算v${$.date('yyMMdd')}`,
    });
    excel.save();
  });
```