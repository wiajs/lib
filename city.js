/*!
 * =====================================================
 * SUI Mobile - http://m.sui.taobao.org/
 *
 * =====================================================
 */
const $ = require('./kdom');

$.config.cityData = [
  {
    "name": "广东",
    "sub": [
      {
        "name": "请选择",
        "sub": []
      },
      {
        "name": "广州",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "越秀区"
          },
          {
            "name": "荔湾区"
          },
          {
            "name": "海珠区"
          },
          {
            "name": "天河区"
          },
          {
            "name": "白云区"
          },
          {
            "name": "黄埔区"
          },
          {
            "name": "番禺区"
          },
          {
            "name": "花都区"
          },
          {
            "name": "南沙区"
          },
          {
            "name": "萝岗区"
          },
          {
            "name": "增城市"
          },
          {
            "name": "从化市"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "深圳",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "福田区"
          },
          {
            "name": "罗湖区"
          },
          {
            "name": "南山区"
          },
          {
            "name": "宝安区"
          },
          {
            "name": "龙岗区"
          },
          {
            "name": "盐田区"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "珠海",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "香洲区"
          },
          {
            "name": "斗门区"
          },
          {
            "name": "金湾区"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "汕头",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "金平区"
          },
          {
            "name": "濠江区"
          },
          {
            "name": "龙湖区"
          },
          {
            "name": "潮阳区"
          },
          {
            "name": "潮南区"
          },
          {
            "name": "澄海区"
          },
          {
            "name": "南澳县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "韶关",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "浈江区"
          },
          {
            "name": "武江区"
          },
          {
            "name": "曲江区"
          },
          {
            "name": "乐昌市"
          },
          {
            "name": "南雄市"
          },
          {
            "name": "始兴县"
          },
          {
            "name": "仁化县"
          },
          {
            "name": "翁源县"
          },
          {
            "name": "新丰县"
          },
          {
            "name": "乳源瑶族自治县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "佛山",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "禅城区"
          },
          {
            "name": "南海区"
          },
          {
            "name": "顺德区"
          },
          {
            "name": "三水区"
          },
          {
            "name": "高明区"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "江门",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "蓬江区"
          },
          {
            "name": "江海区"
          },
          {
            "name": "新会区"
          },
          {
            "name": "恩平市"
          },
          {
            "name": "台山市"
          },
          {
            "name": "开平市"
          },
          {
            "name": "鹤山市"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "湛江",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "赤坎区"
          },
          {
            "name": "霞山区"
          },
          {
            "name": "坡头区"
          },
          {
            "name": "麻章区"
          },
          {
            "name": "吴川市"
          },
          {
            "name": "廉江市"
          },
          {
            "name": "雷州市"
          },
          {
            "name": "遂溪县"
          },
          {
            "name": "徐闻县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "茂名",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "茂南区"
          },
          {
            "name": "茂港区"
          },
          {
            "name": "化州市"
          },
          {
            "name": "信宜市"
          },
          {
            "name": "高州市"
          },
          {
            "name": "电白县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "肇庆",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "端州区"
          },
          {
            "name": "鼎湖区"
          },
          {
            "name": "高要市"
          },
          {
            "name": "四会市"
          },
          {
            "name": "广宁县"
          },
          {
            "name": "怀集县"
          },
          {
            "name": "封开县"
          },
          {
            "name": "德庆县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "惠州",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "惠城区"
          },
          {
            "name": "惠阳区"
          },
          {
            "name": "博罗县"
          },
          {
            "name": "惠东县"
          },
          {
            "name": "龙门县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "梅州",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "梅江区"
          },
          {
            "name": "兴宁市"
          },
          {
            "name": "梅县"
          },
          {
            "name": "大埔县"
          },
          {
            "name": "丰顺县"
          },
          {
            "name": "五华县"
          },
          {
            "name": "平远县"
          },
          {
            "name": "蕉岭县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "汕尾",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "城区"
          },
          {
            "name": "陆丰市"
          },
          {
            "name": "海丰县"
          },
          {
            "name": "陆河县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "河源",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "源城区"
          },
          {
            "name": "紫金县"
          },
          {
            "name": "龙川县"
          },
          {
            "name": "连平县"
          },
          {
            "name": "和平县"
          },
          {
            "name": "东源县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "阳江",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "江城区"
          },
          {
            "name": "阳春市"
          },
          {
            "name": "阳西县"
          },
          {
            "name": "阳东县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "清远",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "清城区"
          },
          {
            "name": "英德市"
          },
          {
            "name": "连州市"
          },
          {
            "name": "佛冈县"
          },
          {
            "name": "阳山县"
          },
          {
            "name": "清新县"
          },
          {
            "name": "连山壮族瑶族自治县"
          },
          {
            "name": "连南瑶族自治县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "东莞",
        "sub": [],
        "type": 0
      },
      {
        "name": "中山",
        "sub": [],
        "type": 0
      },
      {
        "name": "潮州",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "湘桥区"
          },
          {
            "name": "潮安县"
          },
          {
            "name": "饶平县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "揭阳",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "榕城区"
          },
          {
            "name": "普宁市"
          },
          {
            "name": "揭东县"
          },
          {
            "name": "揭西县"
          },
          {
            "name": "惠来县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "云浮",
        "sub": [
          {
            "name": "请选择"
          },
          {
            "name": "云城区"
          },
          {
            "name": "罗定市"
          },
          {
            "name": "云安县"
          },
          {
            "name": "新兴县"
          },
          {
            "name": "郁南县"
          },
          {
            "name": "其他"
          }
        ],
        "type": 0
      },
      {
        "name": "其他"
      }
    ],
    "type": 1
  },
  {
    "name": "重庆",
    "sub": [
      {
        "name": "请选择"
      },
      {
        "name": "渝中区"
      },
      {
        "name": "大渡口区"
      },
      {
        "name": "江北区"
      },
      {
        "name": "南岸区"
      },
      {
        "name": "北碚区"
      },
      {
        "name": "渝北区"
      },
      {
        "name": "巴南区"
      },
      {
        "name": "长寿区"
      },
      {
        "name": "双桥区"
      },
      {
        "name": "沙坪坝区"
      },
      {
        "name": "万盛区"
      },
      {
        "name": "万州区"
      },
      {
        "name": "涪陵区"
      },
      {
        "name": "黔江区"
      },
      {
        "name": "永川区"
      },
      {
        "name": "合川区"
      },
      {
        "name": "江津区"
      },
      {
        "name": "九龙坡区"
      },
      {
        "name": "南川区"
      },
      {
        "name": "綦江县"
      },
      {
        "name": "潼南县"
      },
      {
        "name": "荣昌县"
      },
      {
        "name": "璧山县"
      },
      {
        "name": "大足县"
      },
      {
        "name": "铜梁县"
      },
      {
        "name": "梁平县"
      },
      {
        "name": "开县"
      },
      {
        "name": "忠县"
      },
      {
        "name": "城口县"
      },
      {
        "name": "垫江县"
      },
      {
        "name": "武隆县"
      },
      {
        "name": "丰都县"
      },
      {
        "name": "奉节县"
      },
      {
        "name": "云阳县"
      },
      {
        "name": "巫溪县"
      },
      {
        "name": "巫山县"
      },
      {
        "name": "石柱土家族自治县"
      },
      {
        "name": "秀山土家族苗族自治县"
      },
      {
        "name": "酉阳土家族苗族自治县"
      },
      {
        "name": "彭水苗族土家族自治县"
      },
      {
        "name": "其他"
      }
    ],
    "type": 0
  }
];

function format(data) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    if (d.name === '请选择') continue;
    result.push(d.name);
  }
  if (result.length) return result;
  return [''];
}

function sub(data) {
  if (!data.sub) return [''];
  return format(data.sub);
}

export default class {
  constructor(data) {
    this.data = data;
    this.provinces = data.map(d => d.name);
    this.initCities = sub(data[0]);
    this.initDistricts = [''];
    this.t = null;
    this.currentProvince = this.provinces[0];
    this.currentCity = this.initCities[0];
    this.currentDistrict = this.initDistricts[0];
    this.input = $.qu('#page-city-picker');
  }

  opts = {
    cssClass: 'city-picker',
    rotateEffect: false,  //为了性能

    onChange(picker, values, displayValues) {
      const newProvince = picker.cols[0].value;
      let newCity;
      if (newProvince !== this.currentProvince) {
        // 如果Province变化，节流以提高reRender性能
        clearTimeout(this.t);

        this.t = setTimeout(() => {
          const newCities = this.getData(newProvince);
          newCity = newCities[0];
          const newDistricts = this.getChild(newProvince, newCity);
          picker.cols[1].replaceValues(newCities);
          picker.cols[2].replaceValues(newDistricts);
          this.currentProvince = newProvince;
          this.currentCity = newCity;
          picker.updateValue();
        }, 200);

        return;
      }

      newCity = picker.cols[1].value;
      if (newCity !== this.currentCity) {
        picker.cols[2].replaceValues(this.getChild(newProvince, newCity));
        this.currentCity = newCity;
        picker.updateValue();
      }
    },

    cols: [
      {
        textAlign: 'center',
        values: this.provinces,
        cssClass: 'col-province'
      },
      {
        textAlign: 'center',
        values: this.initCities,
        cssClass: 'col-city'
      },
      {
        textAlign: 'center',
        values: this.initDistricts,
        cssClass: 'col-district'
      }
    ]
  };

  getData(d) {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].name === d) return sub(this.data[i]);
    }
    return [''];
  }

  getChild(p, c) {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].name === p) {
        for (let j = 0; j < this.data[i].sub.length; j++) {
          if (this.data[i].sub[j].name === c) {
            return sub(this.data[i].sub[j]);
          }
        }
      }
    }
    return [''];
  }

  picker(params) {
    const p = Object.assign(this.opts, params);

    // 计算value
    if (p.value) {
      this.input.value = p.value.join(' ');
    } else {
      const val = this.input.value();
      if (val)
        p.value = val.split(' ');
    }

    if (p.value) {
      // p.value = val.split(" ");
      if (p.value[0]) {
        this.currentProvince = p.value[0];
        p.cols[1].values = this.getData(p.value[0]);
      }

      if (p.value[1]) {
        this.currentCity = p.value[1];
        p.cols[2].values = this.getChild(p.value[0], p.value[1]);
      } else {
        p.cols[2].values = this.getChild(p.value[0], p.cols[1].values[0]);
      }

      if (!p.value[2])
        p.value[2] = '';

      this.currentDistrict = p.value[2];
    }

    $(this).picker(p);
  }
}

var raw = $.smConfig.rawCitiesData;

$(document).on("pageInit", "#page-city-picker", function (e) {
  $("#city-picker").cityPicker({
    value: ['天津', '河东区']
    //value: ['四川', '内江', '东兴区']
  });
});
