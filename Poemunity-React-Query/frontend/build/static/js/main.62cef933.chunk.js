(this.webpackJsonpfrontend=this.webpackJsonpfrontend||[]).push([[0],{122:function(e,t,n){},154:function(e,t,n){},155:function(e,t,n){},166:function(e,t,n){},207:function(e,t,n){},208:function(e,t,n){},209:function(e,t,n){},210:function(e,t,n){"use strict";n.r(t);var a=n(0),c=n.n(a),s=n(16),r=n.n(s),i=(n(154),n(27)),o=n(95),l=n(12),u=n(10),d=n(14),j=(n(40),n(73),n(61),n(155),n(274)),m=n(276),b=n(259),h=n(130),O=n.n(h),p=(n(74),["Anniversary","Friendship","Funny","Haikus","Hope","Life","Love","Sad"]),f="Like",_="Likes",x="Title",v="Date",g="Random",N="Likes",k=n(1);function y(){return Object(k.jsx)("div",{children:Object(k.jsxs)(j.a,{className:"accordion",children:[Object(k.jsx)(m.a,{expandIcon:Object(k.jsx)(O.a,{}),"aria-controls":"panel1a-content",id:"panel1a-header",children:Object(k.jsx)("p",{className:"header__dropdown-categories",children:"Categories"})}),Object(k.jsx)("div",{children:null===p||void 0===p?void 0:p.sort().map((function(e){return Object(k.jsx)(b.a,{children:Object(k.jsx)(u.b,{className:"header__dropdown-subcategories",to:"/".concat(e.toLowerCase()),children:e})},e)}))}),Object(k.jsx)(b.a,{children:Object(k.jsx)(u.b,{className:"header__dropdown-subcategories",to:"/",children:"All"})})]})})}var S=n(260),C=(n(263),n(267),n(266),n(262),n(264),n(265),n(214),n(166),n(20)),w=n.n(C),I=n(15);function E(){return Object(I.useQuery)("poems",(function(){return w.a.get("/api/poems").then((function(e){return e.data}))}),{onError:function(e){console.error(e)}})}var L=n(261),T=Object(S.a)((function(e){return{root:{display:"flex","& > * + *":{marginLeft:e.spacing(2)}}}}));function A(){var e=T();return Object(k.jsx)("div",{className:e.root,children:Object(k.jsx)(L.a,{color:"secondary"})})}Object(S.a)({table:{minWidth:50}});var P=n(72);function D(){var e=Object(I.useQueryClient)(),t=Object(a.useContext)(Le);return Object(I.useMutation)((function(e){return w.a.delete("/api/poems/".concat(e),t.config).then((function(e){return e.data}))}),{onSuccess:function(t,n){e.invalidateQueries("poems")},onError:function(e){console.error(e)}})}function B(){var e=Object(I.useQueryClient)(),t=Object(a.useContext)(Le);return Object(I.useMutation)((function(e){return w.a.put("/api/poems/".concat(e),null,t.config).then((function(e){return e.data}))}),{onSuccess:function(t,n){e.invalidateQueries("poems")},onError:function(e){console.error(e)}})}var R=n(271),J=n(56),U=n.n(J),Q=n(45),F=n.n(Q),M=n(57),H=n.n(M),W=n(46),z=n.n(W);var q=function(e){return e.charAt(0).toUpperCase()+e.slice(1)};var Y=function(e,t){return e===x&&t.sort((function(e,t){return e.title.toLowerCase()<t.title.toLowerCase()?-1:e.title.toLowerCase()>t.title.toLowerCase()?1:0})),e===N&&t.sort((function(e,t){return t.likes.length-e.likes.length})),e===g&&t.sort((function(){return Math.random()-.5})),e===v&&t.sort((function(e,t){return new Date(t.date)-new Date(e.date)})),t},K=n(94),V={0:["\xb0","\u2080","\u06f0","\uff10"],1:["\xb9","\u2081","\u06f1","\uff11"],2:["\xb2","\u2082","\u06f2","\uff12"],3:["\xb3","\u2083","\u06f3","\uff13"],4:["\u2074","\u2084","\u06f4","\u0664","\uff14"],5:["\u2075","\u2085","\u06f5","\u0665","\uff15"],6:["\u2076","\u2086","\u06f6","\u0666","\uff16"],7:["\u2077","\u2087","\u06f7","\uff17"],8:["\u2078","\u2088","\u06f8","\uff18"],9:["\u2079","\u2089","\u06f9","\uff19"],a:["\xe0","\xe1","\u1ea3","\xe3","\u1ea1","\u0103","\u1eaf","\u1eb1","\u1eb3","\u1eb5","\u1eb7","\xe2","\u1ea5","\u1ea7","\u1ea9","\u1eab","\u1ead","\u0101","\u0105","\xe5","\u03b1","\u03ac","\u1f00","\u1f01","\u1f02","\u1f03","\u1f04","\u1f05","\u1f06","\u1f07","\u1f80","\u1f81","\u1f82","\u1f83","\u1f84","\u1f85","\u1f86","\u1f87","\u1f70","\u03ac","\u1fb0","\u1fb1","\u1fb2","\u1fb3","\u1fb4","\u1fb6","\u1fb7","\u0430","\u0623","\u1021","\u102c","\u102b","\u01fb","\u01ce","\xaa","\u10d0","\u0905","\u0627","\uff41","\xe4"],b:["\u0431","\u03b2","\u0628","\u1017","\u10d1","\uff42"],c:["\xe7","\u0107","\u010d","\u0109","\u010b","\uff43"],d:["\u010f","\xf0","\u0111","\u018c","\u0221","\u0256","\u0257","\u1d6d","\u1d81","\u1d91","\u0434","\u03b4","\u062f","\u0636","\u100d","\u1012","\u10d3","\uff44"],e:["\xe9","\xe8","\u1ebb","\u1ebd","\u1eb9","\xea","\u1ebf","\u1ec1","\u1ec3","\u1ec5","\u1ec7","\xeb","\u0113","\u0119","\u011b","\u0115","\u0117","\u03b5","\u03ad","\u1f10","\u1f11","\u1f12","\u1f13","\u1f14","\u1f15","\u1f72","\u03ad","\u0435","\u0451","\u044d","\u0454","\u0259","\u1027","\u1031","\u1032","\u10d4","\u090f","\u0625","\u0626","\uff45"],f:["\u0444","\u03c6","\u0641","\u0192","\u10e4","\uff46"],g:["\u011d","\u011f","\u0121","\u0123","\u0433","\u0491","\u03b3","\u1002","\u10d2","\u06af","\uff47"],h:["\u0125","\u0127","\u03b7","\u03ae","\u062d","\u0647","\u101f","\u103e","\u10f0","\uff48"],i:["\xed","\xec","\u1ec9","\u0129","\u1ecb","\xee","\xef","\u012b","\u012d","\u012f","\u0131","\u03b9","\u03af","\u03ca","\u0390","\u1f30","\u1f31","\u1f32","\u1f33","\u1f34","\u1f35","\u1f36","\u1f37","\u1f76","\u03af","\u1fd0","\u1fd1","\u1fd2","\u0390","\u1fd6","\u1fd7","\u0456","\u0457","\u0438","\u1023","\u102d","\u102e","\u100a\u103a","\u01d0","\u10d8","\u0907","\u06cc","\uff49"],j:["\u0135","\u0458","\u0408","\u10ef","\u062c","\uff4a"],k:["\u0137","\u0138","\u043a","\u03ba","\u0136","\u0642","\u0643","\u1000","\u10d9","\u10e5","\u06a9","\uff4b"],l:["\u0142","\u013e","\u013a","\u013c","\u0140","\u043b","\u03bb","\u0644","\u101c","\u10da","\uff4c"],m:["\u043c","\u03bc","\u0645","\u1019","\u10db","\uff4d"],n:["\xf1","\u0144","\u0148","\u0146","\u0149","\u014b","\u03bd","\u043d","\u0646","\u1014","\u10dc","\uff4e"],o:["\xf3","\xf2","\u1ecf","\xf5","\u1ecd","\xf4","\u1ed1","\u1ed3","\u1ed5","\u1ed7","\u1ed9","\u01a1","\u1edb","\u1edd","\u1edf","\u1ee1","\u1ee3","\xf8","\u014d","\u0151","\u014f","\u03bf","\u1f40","\u1f41","\u1f42","\u1f43","\u1f44","\u1f45","\u1f78","\u03cc","\u043e","\u0648","\u03b8","\u102d\u102f","\u01d2","\u01ff","\xba","\u10dd","\u0913","\uff4f","\xf6"],p:["\u043f","\u03c0","\u1015","\u10de","\u067e","\uff50"],q:["\u10e7","\uff51"],r:["\u0155","\u0159","\u0157","\u0440","\u03c1","\u0631","\u10e0","\uff52"],s:["\u015b","\u0161","\u015f","\u0441","\u03c3","\u0219","\u03c2","\u0633","\u0635","\u1005","\u017f","\u10e1","\uff53"],t:["\u0165","\u0163","\u0442","\u03c4","\u021b","\u062a","\u0637","\u100b","\u1010","\u0167","\u10d7","\u10e2","\uff54"],u:["\xfa","\xf9","\u1ee7","\u0169","\u1ee5","\u01b0","\u1ee9","\u1eeb","\u1eed","\u1eef","\u1ef1","\xfb","\u016b","\u016f","\u0171","\u016d","\u0173","\xb5","\u0443","\u1009","\u102f","\u1030","\u01d4","\u01d6","\u01d8","\u01da","\u01dc","\u10e3","\u0909","\uff55","\u045e","\xfc"],v:["\u0432","\u10d5","\u03d0","\uff56"],w:["\u0175","\u03c9","\u03ce","\u101d","\u103d","\uff57"],x:["\u03c7","\u03be","\uff58"],y:["\xfd","\u1ef3","\u1ef7","\u1ef9","\u1ef5","\xff","\u0177","\u0439","\u044b","\u03c5","\u03cb","\u03cd","\u03b0","\u064a","\u101a","\uff59"],z:["\u017a","\u017e","\u017c","\u0437","\u03b6","\u0632","\u1007","\u10d6","\uff5a"],aa:["\u0639","\u0906","\u0622"],ae:["\xe6","\u01fd"],ai:["\u0910"],ch:["\u0447","\u10e9","\u10ed","\u0686"],dj:["\u0452","\u0111"],dz:["\u045f","\u10eb"],ei:["\u090d"],gh:["\u063a","\u10e6"],ii:["\u0908"],ij:["\u0133"],kh:["\u0445","\u062e","\u10ee"],lj:["\u0459"],nj:["\u045a"],oe:["\xf6","\u0153","\u0624"],oi:["\u0911"],oii:["\u0912"],ps:["\u03c8"],sh:["\u0448","\u10e8","\u0634"],shch:["\u0449"],ss:["\xdf"],sx:["\u015d"],th:["\xfe","\u03d1","\u062b","\u0630","\u0638"],ts:["\u0446","\u10ea","\u10ec"],ue:["\xfc"],uu:["\u090a"],ya:["\u044f"],yu:["\u044e"],zh:["\u0436","\u10df","\u0698"],"(c)":["\xa9"],A:["\xc1","\xc0","\u1ea2","\xc3","\u1ea0","\u0102","\u1eae","\u1eb0","\u1eb2","\u1eb4","\u1eb6","\xc2","\u1ea4","\u1ea6","\u1ea8","\u1eaa","\u1eac","\xc5","\u0100","\u0104","\u0391","\u0386","\u1f08","\u1f09","\u1f0a","\u1f0b","\u1f0c","\u1f0d","\u1f0e","\u1f0f","\u1f88","\u1f89","\u1f8a","\u1f8b","\u1f8c","\u1f8d","\u1f8e","\u1f8f","\u1fb8","\u1fb9","\u1fba","\u0386","\u1fbc","\u0410","\u01fa","\u01cd","\uff21","\xc4"],B:["\u0411","\u0392","\u092c","\uff22"],C:["\xc7","\u0106","\u010c","\u0108","\u010a","\uff23"],D:["\u010e","\xd0","\u0110","\u0189","\u018a","\u018b","\u1d05","\u1d06","\u0414","\u0394","\uff24"],E:["\xc9","\xc8","\u1eba","\u1ebc","\u1eb8","\xca","\u1ebe","\u1ec0","\u1ec2","\u1ec4","\u1ec6","\xcb","\u0112","\u0118","\u011a","\u0114","\u0116","\u0395","\u0388","\u1f18","\u1f19","\u1f1a","\u1f1b","\u1f1c","\u1f1d","\u0388","\u1fc8","\u0415","\u0401","\u042d","\u0404","\u018f","\uff25"],F:["\u0424","\u03a6","\uff26"],G:["\u011e","\u0120","\u0122","\u0413","\u0490","\u0393","\uff27"],H:["\u0397","\u0389","\u0126","\uff28"],I:["\xcd","\xcc","\u1ec8","\u0128","\u1eca","\xce","\xcf","\u012a","\u012c","\u012e","\u0130","\u0399","\u038a","\u03aa","\u1f38","\u1f39","\u1f3b","\u1f3c","\u1f3d","\u1f3e","\u1f3f","\u1fd8","\u1fd9","\u1fda","\u038a","\u0418","\u0406","\u0407","\u01cf","\u03d2","\uff29"],J:["\uff2a"],K:["\u041a","\u039a","\uff2b"],L:["\u0139","\u0141","\u041b","\u039b","\u013b","\u013d","\u013f","\u0932","\uff2c"],M:["\u041c","\u039c","\uff2d"],N:["\u0143","\xd1","\u0147","\u0145","\u014a","\u041d","\u039d","\uff2e"],O:["\xd3","\xd2","\u1ece","\xd5","\u1ecc","\xd4","\u1ed0","\u1ed2","\u1ed4","\u1ed6","\u1ed8","\u01a0","\u1eda","\u1edc","\u1ede","\u1ee0","\u1ee2","\xd8","\u014c","\u0150","\u014e","\u039f","\u038c","\u1f48","\u1f49","\u1f4a","\u1f4b","\u1f4c","\u1f4d","\u1ff8","\u038c","\u041e","\u0398","\u04e8","\u01d1","\u01fe","\uff2f","\xd6"],P:["\u041f","\u03a0","\uff30"],Q:["\uff31"],R:["\u0158","\u0154","\u0420","\u03a1","\u0156","\uff32"],S:["\u015e","\u015c","\u0218","\u0160","\u015a","\u0421","\u03a3","\uff33"],T:["\u0164","\u0162","\u0166","\u021a","\u0422","\u03a4","\uff34"],U:["\xda","\xd9","\u1ee6","\u0168","\u1ee4","\u01af","\u1ee8","\u1eea","\u1eec","\u1eee","\u1ef0","\xdb","\u016a","\u016e","\u0170","\u016c","\u0172","\u0423","\u01d3","\u01d5","\u01d7","\u01d9","\u01db","\uff35","\u040e","\xdc"],V:["\u0412","\uff36"],W:["\u03a9","\u038f","\u0174","\uff37"],X:["\u03a7","\u039e","\uff38"],Y:["\xdd","\u1ef2","\u1ef6","\u1ef8","\u1ef4","\u0178","\u1fe8","\u1fe9","\u1fea","\u038e","\u042b","\u0419","\u03a5","\u03ab","\u0176","\uff39"],Z:["\u0179","\u017d","\u017b","\u0417","\u0396","\uff3a"],AE:["\xc6","\u01fc"],Ch:["\u0427"],Dj:["\u0402"],Dz:["\u040f"],Gx:["\u011c"],Hx:["\u0124"],Ij:["\u0132"],Jx:["\u0134"],Kh:["\u0425"],Lj:["\u0409"],Nj:["\u040a"],Oe:["\u0152"],Ps:["\u03a8"],Sh:["\u0428"],Shch:["\u0429"],Ss:["\u1e9e"],Th:["\xde"],Ts:["\u0426"],Ya:["\u042f"],Yu:["\u042e"],Zh:["\u0416"],"-":[" "]},G=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=String(e);return t=(t=t.replace(/^\s+|\s+$/g,"")).toLowerCase(),Object.keys(V).forEach((function(e){V[e].forEach((function(n){t=t.replace(new RegExp(n,"g"),e)}))})),t},Z=n(23),$=Object(Z.a)();function X(e){var t=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:window.location.search,t=new URLSearchParams(e);return Array.from(t.keys()).reduce((function(e,n){return"__proto__"!==n&&(e[n]=t.has(n)?JSON.parse(t.get(n)):null),e}),{})}();return t[e]}function ee(e){var t=Object(a.useState)(e),n=Object(l.a)(t,2),c=n[0],s=n[1];return Object(a.useEffect)((function(){var t=Object.keys(e),n={};t.forEach((function(e){var t=X(e);void 0!==t&&(n[e]=t)})),s(Object(i.a)(Object(i.a)({},c),n))}),[]),Object(a.useEffect)((function(){var t=Object.keys(c).map((function(e){return{key:e,value:c[e]}})),n=[],a=t.filter((function(t){var a=t.key,c=t.value,s=X(a)!==c,r=c===e[a],i=null!==c&&void 0!==c;return!r&&i||n.push(a),s&&!r&&i}));a.length+n.length>=1&&function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];try{var n=new URLSearchParams(window.location.search);t.forEach((function(e){return n.delete(e)})),console.log(t),e.forEach((function(e){var t=e.key,a=e.value,c=JSON.stringify(a);console.log("Adding key ".concat(t," with value ").concat(c)),n.set(t,c)})),n.toString()!==window.location.search&&$.push({search:n.toString(),pathname:$.location.pathname})}catch(a){console.error(a.stack)}}(a,n)}),[JSON.stringify(c)]),[c,s]}var te=function(e){var t=e.match.params.genre,n=Object(a.useState)([]),c=Object(l.a)(n,2),s=c[0],r=c[1],i=Object(a.useState)(""),o=Object(l.a)(i,2),j=o[0],m=o[1],b=Object(d.f)(),h=Object(a.useContext)(Le),O=E();console.log(O);var p=ee({orderBy:null}),y=Object(l.a)(p,2),S=y[0],C=y[1];Object(a.useEffect)((function(){if(O.data){var e=Object(P.a)(O.data);if(t){var n=e.filter((function(e){return e.genre===t})),a=Y(S.orderBy,n);r(a)}else{var c=Y(S.orderBy,e);r(c)}}}),[JSON.stringify([O.data,t,S])]);var w=D(),I=B(),L=function(e,t){e.preventDefault(),I.mutate(t)};return O.isLoading?Object(k.jsx)(A,{}):(console.log(O),Object(k.jsxs)(k.Fragment,{children:[Object(k.jsx)(K.a,{children:Object(k.jsx)("title",{children:t?"".concat(q(t)," poems"):"Poemunity"})}),Object(k.jsxs)("div",{className:"list__container",children:[Object(k.jsxs)("div",{className:"list__intro",children:[t&&Object(k.jsxs)("p",{className:"list__presentation",children:["Category: ",t.toUpperCase()]}),Object(k.jsxs)("div",{className:"list__search",children:[Object(k.jsx)("div",{className:"separator"}),Object(k.jsx)(U.a,{style:{fontSize:40,fill:"#4F5D73"}}),Object(k.jsx)(R.a,{label:"Search an author",InputLabelProps:{style:{color:"#4F5D73"}},InputProps:{style:{color:"#4F5D73"}},onChange:function(e){m(G(e.target.value))}})]}),Object(k.jsx)("form",{className:"list__sort",children:Object(k.jsxs)("label",{children:["Order poems by: ",Object(k.jsxs)("select",{type:"submit",id:"sort",name:"sort",onChange:function(e){!function(e){var t=e.id,n=e.value;try{var a=new URLSearchParams(window.location.search),c=JSON.stringify(n);a.set(t,c),$.push({search:a.toString(),pathname:$.location.pathname})}catch(s){console.error(s.stack)}}({id:"orderBy",value:e.target.value}),C({orderBy:e.target.value})},children:[Object(k.jsx)("option",{value:N,selected:N===S.orderBy,children:N}),Object(k.jsx)("option",{value:v,selected:v===S.orderBy,children:v}),Object(k.jsx)("option",{value:g,selected:g===S.orderBy,children:g}),Object(k.jsx)("option",{value:x,selected:x===S.orderBy,children:x})]})]})})]}),null===s||void 0===s?void 0:s.map((function(e){var t,n,a,c;return Object(k.jsx)("main",{className:"poem__detail",children:G(e.author).includes(j)&&Object(k.jsxs)("section",{className:"poem__block",children:[Object(k.jsxs)("section",{children:[Object(k.jsx)(u.b,{to:"/detail/".concat(e.id),className:"poem__title",children:e.title}),Object(k.jsxs)("div",{className:"poem__author-container",children:[Object(k.jsx)("img",{className:"poem__picture",src:e.picture}),Object(k.jsx)("p",{className:"poem__author",children:e.author})]}),Object(k.jsx)("div",{className:"poem__date",children:e.date})]}),Object(k.jsxs)("section",{children:[Object(k.jsx)("div",{className:"poem__content poems__content",children:e.poem}),Object(k.jsx)("div",{className:"poems__read-more",children:Object(k.jsx)(u.b,{to:"/detail/".concat(e.id),className:"poems__read-more",children:"Read more"})})]}),Object(k.jsxs)("section",{className:"poem__footer",children:[1===(null===(t=e.likes)||void 0===t?void 0:t.length)&&Object(k.jsxs)("div",{className:"poem__likes",children:[null===(n=e.likes)||void 0===n?void 0:n.length," ",f]}),1!==(null===(a=e.likes)||void 0===a?void 0:a.length)&&Object(k.jsxs)("div",{className:"poem__likes",children:[null===(c=e.likes)||void 0===c?void 0:c.length," ",_]}),Object(k.jsx)("div",{className:"separator"}),h.user&&e.author!==h.username&&e.likes.some((function(e){return e===h.username}))&&Object(k.jsx)(u.b,{className:"poem__likes-icon",onClick:function(t){return L(t,e.id)}}),h.user&&e.author!==h.username&&!e.likes.some((function(e){return e===h.username}))&&Object(k.jsx)(u.b,{className:"poem__unlikes-icon",onClick:function(t){return L(t,e.id)}}),h.user&&(e.author===h.username||h.userId===h.adminId)&&Object(k.jsx)(H.a,{className:"poem__edit-icon",onClick:function(t){return n=e.id,b.push("/profile"),void h.setState({elementToEdit:n});var n}}),h.user&&(e.author===h.username||h.userId===h.adminId)&&Object(k.jsx)(F.a,{className:"poem__delete-icon",style:{fill:"red"},onClick:function(t){return w.mutate(e.id)}}),Object(k.jsx)(u.b,{to:"/detail/".concat(e.id),className:"poem__comments-icon",children:Object(k.jsx)(z.a,{style:{fill:"#000"}})})]})]})},e.id)}))]})]}))};var ne=function(e){return Object(k.jsxs)("main",{className:"dashboard",children:[Object(k.jsx)("div",{className:"dashboard__accordion",children:Object(k.jsx)(y,{})}),Object(k.jsx)("div",{className:"dashboard__list",children:Object(k.jsx)(te,Object(i.a)({},e))}),Object(k.jsx)("div",{className:"dashboard__ranking"})]})},ae=n(134),ce=n.n(ae);n(122);function se(e){var t=Object(I.useQueryClient)();return Object(I.useQuery)(["poems",e],(function(){return w.a.get("/api/poems/".concat(e)).then((function(e){return e.data}))}),{initialData:function(){var n;return null===(n=t.getQueryData("poems"))||void 0===n?void 0:n.find((function(t){return t.id===e}))},initialStale:!0,onError:function(e){console.error(e)}})}var re=function(e){var t=Object(a.useState)({id:"",title:"",picture:"",author:"",date:"",poem:"",likes:[]}),n=Object(l.a)(t,2),c=n[0],s=n[1],r=Object(a.useContext)(Le),i=se(e.match.params.poemId);Object(a.useEffect)((function(){i.data&&s(i.data)}),[JSON.stringify(i.data)]);var o=D(),j=B();function m(e,t){e.preventDefault(),j.mutate(t)}var b=Object(d.f)();if(i.isLoading)return Object(k.jsx)(A,{});var h={url:"http://localhost:3000/detail/".concat(e.match.params.poemId),identifier:"http://localhost:3000/detail/".concat(e.match.params.poemId),title:"Title of Your Article"};return Object(k.jsxs)(k.Fragment,{children:[!c&&Object(k.jsx)("main",{className:"page-not-found__container",children:Object(k.jsxs)("section",{className:"page-not-found__message",children:[Object(k.jsx)("h1",{className:"page-not-found__title",children:"Error - 404"}),Object(k.jsx)("p",{className:"page-not-found__text",children:"Nothing to see here"}),Object(k.jsx)(u.b,{className:"page-not-found__link",to:"/",children:"Back to Dashboard"})]})}),c&&c.likes&&Object(k.jsxs)("main",{className:"poem__detail",children:[Object(k.jsx)(K.a,{children:Object(k.jsx)("title",{children:"Poem: ".concat(c.title)})}),Object(k.jsxs)("section",{className:"poem__block",children:[Object(k.jsxs)("section",{children:[Object(k.jsx)("h2",{className:"poem__title",children:c.title}),Object(k.jsxs)("div",{className:"poem__author-container",children:[Object(k.jsx)("img",{className:"poem__picture",src:c.picture}),Object(k.jsx)("p",{className:"poem__author",children:c.author})]}),Object(k.jsx)("div",{className:"poem__date",children:c.date})]}),Object(k.jsx)("section",{children:Object(k.jsx)("div",{className:"poem__content",children:c.poem})}),Object(k.jsx)("br",{}),Object(k.jsxs)("section",{className:"poem__footer",children:[1===c.likes.length&&Object(k.jsxs)("div",{className:"poem__likes",children:[c.likes.length," ",f]}),1!==c.likes.length&&Object(k.jsxs)("div",{className:"poem__likes",children:[c.likes.length," ",_]}),Object(k.jsx)("div",{className:"separator"}),r.user&&c.author!==r.username&&c.likes.some((function(e){return e===r.username}))&&Object(k.jsx)("div",{className:"poem__likes-icon",onClick:function(e){return m(e,c.id)}}),r.user&&c.author!==r.username&&!c.likes.some((function(e){return e===r.username}))&&Object(k.jsx)("div",{className:"poem__unlikes-icon",onClick:function(e){return m(e,c.id)}}),r.user&&(c.author===r.username||r.userId===r.adminId)&&Object(k.jsx)(H.a,{className:"poem__edit-icon",onClick:function(e){return t=c.id,b.push("/profile"),void r.setState({elementToEdit:t});var t}}),r.user&&(c.author===r.username||r.userId===r.adminId)&&Object(k.jsx)(F.a,{className:"poem__delete-icon",style:{fill:"red"},onClick:function(e){return o.mutate(c.id)}}),Object(k.jsx)(u.b,{to:"/detail/".concat(c.id),className:"poem__comments-icon",children:Object(k.jsx)(z.a,{style:{fill:"#000"}})})]})]}),Object(k.jsx)("div",{className:"article-container",children:Object(k.jsx)(ce.a.DiscussionEmbed,{shortname:"poemunity",config:h})})]})]})},ie=function(){var e=Object(d.f)();return Object(k.jsx)("button",{className:"header__login",onClick:function(){return e.push("/login")}})},oe=function(){var e=Object(d.f)();return Object(k.jsx)("button",{className:"header__logout",onClick:function(t){t.preventDefault(),window.localStorage.removeItem("loggedUser"),e.push("/")}})},le=function(e){if(e){var t=e.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),n=decodeURIComponent(atob(t).split("").map((function(e){return"%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)})).join(""));return JSON.parse(n)}};var ue=function(){var e=Object(a.useContext)(Le),t=Object(d.g)();return Object(a.useEffect)((function(){var t,n,a=window.localStorage.getItem("loggedUser");e.setState({user:JSON.parse(a),userId:null===(t=le(JSON.parse(a)))||void 0===t?void 0:t.id,username:null===(n=le(JSON.parse(a)))||void 0===n?void 0:n.username,config:{headers:{Authorization:"Bearer ".concat(JSON.parse(a))}}})}),[JSON.stringify(t)]),Object(k.jsx)(k.Fragment,{children:Object(k.jsxs)("section",{className:"header",children:[Object(k.jsx)("div",{className:"header__dropdown",children:Object(k.jsx)(y,{})}),Object(k.jsxs)("div",{className:"header__logo",children:[Object(k.jsx)(u.b,{to:"/",className:"header__text-logo-first",children:"P"}),Object(k.jsx)(u.b,{to:"/",className:"header__logo-icon"}),Object(k.jsx)(u.b,{to:"/",className:"header__text-logo-second",children:"emunity"})]}),Object(k.jsx)("p",{className:"list__presentation",children:"Your poem community!!"}),Object(k.jsx)("div",{className:"separator"}),e.user?Object(k.jsx)(u.b,{to:"/profile",className:"header__profile"}):Object(k.jsx)(k.Fragment,{}),e.user?Object(k.jsx)(oe,{}):Object(k.jsx)(ie,{})]})})},de=n(135),je=n.n(de),me=n(31),be=n(269),he=n(273),Oe=n(270),pe=n(268),fe=n(272),_e=(n(207),function(e,t){return e.filter((function(e){return(null===e||void 0===e?void 0:e.author)===t}))});var xe=function(e){var t=Object(a.useState)([]),n=Object(l.a)(t,2),c=n[0],s=n[1],r=Object(a.useState)(""),i=Object(l.a)(r,2),o=i[0],d=i[1],j=Object(a.useContext)(Le),m=E();Object(a.useEffect)((function(){if(m.data){var e=_e(m.data,j.username);s(e)}}),[JSON.stringify([m.data,j.username])]);var b=D();return Object(k.jsxs)(k.Fragment,{children:[Object(k.jsxs)("div",{className:"search__container",children:[Object(k.jsx)("div",{className:"separator"}),Object(k.jsxs)("div",{className:"list__intro",children:[Object(k.jsx)(U.a,{style:{fontSize:40,fill:"#551A8B"}}),Object(k.jsx)(R.a,{label:"Buscar autor",InputLabelProps:{style:{color:"#551A8B"}},InputProps:{style:{color:"#551A8B"}},onChange:function(e){d(e.target.value)}})]})]}),c.map((function(e){var t;return Object(k.jsx)("main",{className:"poem__detail",children:(null===(t=e.author)||void 0===t?void 0:t.includes(o))&&Object(k.jsxs)("section",{className:"poem__block",children:[Object(k.jsxs)("section",{children:[Object(k.jsx)(u.b,{to:"/detail/".concat(e.id),className:"poem__title",children:e.title}),Object(k.jsx)("p",{className:"poem__author",children:null===e||void 0===e?void 0:e.author}),Object(k.jsx)("div",{className:"poem__date",children:e.date})]}),Object(k.jsxs)("section",{children:[Object(k.jsx)("div",{className:"poem__content poems__content",children:e.poem}),Object(k.jsx)("div",{className:"poems__read-more",children:Object(k.jsx)(u.b,{to:"/detail/".concat(e.id),className:"poems__read-more",children:"Leer m\xe1s"})})]}),Object(k.jsxs)("section",{className:"poem__footer",children:[1===e.likes.length&&Object(k.jsxs)("div",{className:"poem__likes",children:[e.likes.length," ","Like"]}),1!==e.likes.length&&Object(k.jsxs)("div",{className:"poem__likes",children:[e.likes.length," ","Likes"]}),Object(k.jsx)("div",{className:"separator"}),j.user&&(e.author===j.username||j.userId===j.adminId)&&Object(k.jsx)(H.a,{className:"poem__edit-icon",onClick:function(t){return n=e.id,void j.setState({elementToEdit:n});var n}}),j.user&&e.author===j.username&&Object(k.jsx)(F.a,{className:"poem__delete-icon",style:{fill:"red"},onClick:function(t){return b.mutate(e.id)}}),Object(k.jsx)(u.b,{to:"/detail/".concat(e.id),className:"poem__comments-icon",children:Object(k.jsx)(z.a,{style:{fill:"#000"}})})]})]})},e.id)}))]})},ve=function(e,t){return e.filter((function(e){return e.likes.some((function(e){return e===t}))}))};var ge=function(e){var t=Object(a.useContext)(Le),n=Object(a.useState)([]),c=Object(l.a)(n,2),s=c[0],r=c[1],i=Object(a.useState)(""),o=Object(l.a)(i,2),d=o[0],j=o[1],m=E();Object(a.useEffect)((function(){if(m.data){var e=ve(m.data,t.userId);r(e)}}),[JSON.stringify([m.data,t.username])]);var b=D(),h=B();function O(e,t){e.preventDefault(),h.mutate(t)}return Object(k.jsxs)(k.Fragment,{children:[Object(k.jsxs)("div",{className:"search__container",children:[Object(k.jsx)("div",{className:"separator"}),Object(k.jsxs)("div",{className:"list__intro",children:[Object(k.jsx)(U.a,{style:{fontSize:40,fill:"#551A8B"}}),Object(k.jsx)(R.a,{label:"Buscar autor",InputLabelProps:{style:{color:"#551A8B"}},InputProps:{style:{color:"#551A8B"}},onChange:function(e){j(e.target.value)}})]})]}),s.map((function(e){return Object(k.jsx)("main",{className:"poem__detail",children:e.author.includes(d)&&Object(k.jsxs)("section",{className:"poem__block",children:[Object(k.jsxs)("section",{children:[Object(k.jsx)(u.b,{to:"/detail/".concat(e.id),className:"poem__title",children:e.title}),Object(k.jsxs)("div",{className:"poem__author-container",children:[Object(k.jsx)("img",{className:"poem__picture",src:e.picture}),Object(k.jsx)("p",{className:"poem__author",children:e.author})]}),Object(k.jsx)("div",{className:"poem__date",children:e.date})]}),Object(k.jsxs)("section",{children:[Object(k.jsx)("div",{className:"poem__content poems__content",children:e.poem}),Object(k.jsx)("div",{className:"poems__read-more",children:Object(k.jsx)(u.b,{to:"/detail/".concat(e.id),className:"poems__read-more",children:"Leer m\xe1s"})})]}),Object(k.jsxs)("section",{className:"poem__footer",children:[1===e.likes.length&&Object(k.jsxs)("div",{className:"poem__likes",children:[e.likes.length," ","Like"]}),1!==e.likes.length&&Object(k.jsxs)("div",{className:"poem__likes",children:[e.likes.length," ","Likes"]}),Object(k.jsx)("div",{className:"separator"}),t.user&&e.author!==t.username&&e.likes.some((function(e){return e===t.username}))&&Object(k.jsx)(u.b,{className:"poem__likes-icon",onClick:function(t){return O(t,e.id)}}),t.user&&e.author!==t.username&&!e.likes.some((function(e){return e===t.username}))&&Object(k.jsx)(u.b,{className:"poem__unlikes-icon",onClick:function(t){return O(t,e.id)}}),t.user&&e.author===t.username&&Object(k.jsx)(F.a,{className:"poem__delete-icon",style:{fill:"red"},onClick:function(t){return b.mutate(e.id)}}),Object(k.jsx)(u.b,{to:"/detail/".concat(e.id),className:"poem__comments-icon",children:Object(k.jsx)(z.a,{style:{fill:"#000"}})})]})]})},e.id)}))]})};var Ne=["children","value","index"];function ke(e){var t=e.children,n=e.value,a=e.index,c=Object(o.a)(e,Ne);return Object(k.jsx)("div",Object(i.a)(Object(i.a)({role:"tabpanel",hidden:n!==a,id:"full-width-tabpanel-".concat(a),"aria-labelledby":"full-width-tab-".concat(a)},c),{},{children:n===a&&Object(k.jsx)(fe.a,{p:3,children:Object(k.jsx)(pe.a,{children:t})})}))}function ye(e){return{id:"full-width-tab-".concat(e),"aria-controls":"full-width-tabpanel-".concat(e)}}Object(S.a)((function(e){return{root:{backgroundColor:e.palette.background.paper,width:500}}}));function Se(e){var t=Object(me.a)(),n=c.a.useState(0),s=Object(l.a)(n,2),r=s[0],o=s[1],u=Object(a.useState)(""),d=Object(l.a)(u,2),j=d[0],m=d[1],b=Object(a.useState)(""),h=Object(l.a)(b,2),O=h[0],f=h[1],_=Object(a.useState)(""),x=Object(l.a)(_,2),v=x[0],g=x[1],N=Object(a.useState)(""),y=Object(l.a)(N,2),S=y[0],C=y[1],E=Object(a.useState)([]),L=Object(l.a)(E,2),T=L[0],A=L[1],D=function(){var e=Object(I.useQueryClient)(),t=Object(a.useContext)(Le);return Object(I.useMutation)((function(e){console.log(e),w.a.post("/api/poems",e,t.config).then((function(e){return e.data}))}),{onSuccess:function(){e.invalidateQueries("poems")},onError:function(e){console.error(e)}})}(),B=function(){var e=Object(I.useQueryClient)();return Object(I.useMutation)((function(e){var t=e.poem,n=e.poemId;return w.a.patch("/api/poems/".concat(n),t).then((function(e){return e.data}))}),{onSuccess:function(){e.invalidateQueries("poems")},onError:function(e){console.error(e)}})}(),R=Object(a.useContext)(Le),J=se(R.elementToEdit);Object(a.useEffect)((function(){var e,t,n,a,c,s;g(R.elementToEdit?null===J||void 0===J||null===(e=J.data)||void 0===e?void 0:e.title:""),m(R.elementToEdit?null===J||void 0===J||null===(t=J.data)||void 0===t?void 0:t.poem:""),f(R.elementToEdit?null===J||void 0===J||null===(n=J.data)||void 0===n?void 0:n.userId:""),A(R.elementToEdit?null===J||void 0===J||null===(a=J.data)||void 0===a||null===(c=a.likes)||void 0===c?void 0:c.toString():[]),C(R.elementToEdit?null===J||void 0===J||null===(s=J.data)||void 0===s?void 0:s.genre:"")}),[JSON.stringify([R.elementToEdit,J.data])]);function U(e,t){t(e)}return Object(k.jsx)("main",{className:"profile__main",children:R.user?Object(k.jsxs)("div",{children:[Object(k.jsx)("section",{className:"profile__title",children:Object(k.jsxs)("div",{children:[R.username,"'s Profile"]})}),Object(k.jsxs)("section",{className:"profile__intro",children:[Object(k.jsx)("img",{className:"profile__image",alt:R.username}),Object(k.jsx)("div",{className:"profile__personal-data",children:Object(k.jsxs)("div",{className:"profile__insert-poem",children:[Object(k.jsx)("p",{className:"profile__insert-poem-title",children:"Insert a poem:"}),Object(k.jsx)("br",{}),Object(k.jsxs)("form",{className:"profile__insert-poem-form",children:[Object(k.jsxs)("div",{className:"profile__insert-poem-inputs",children:[R.userId===R.adminId&&Object(k.jsxs)(k.Fragment,{children:[Object(k.jsxs)("label",{className:"profile__insert-poem-input",children:["Author's Id: ",Object(k.jsx)("input",{className:"profile__insert-poem-input",name:"author",required:!0,value:O,onChange:function(e){return U(e.target.value,f)}})]}),Object(k.jsxs)("label",{className:"profile__insert-poem-input",children:["Likes",Object(k.jsx)("input",{className:"profile__insert-poem-input",name:"likes",value:T,onChange:function(e){return U(e.target.value,A)}})]})]}),Object(k.jsxs)("label",{className:"profile__insert-poem-input",children:["Title: ",Object(k.jsx)("input",{className:"profile__insert-poem-input",placeholder:"Title",name:"title",required:!0,value:v,onChange:function(e){return U(e.target.value,g)}})]}),Object(k.jsxs)("label",{className:"profile__insert-poem-input",children:["Category: ",Object(k.jsxs)("select",{className:"profile__insert-poem-input",id:"category",name:"category",required:!0,onChange:function(e){U(e.target.value,C)},children:[Object(k.jsx)("option",{value:"",children:"Select"}),null===p||void 0===p?void 0:p.map((function(e){var t;return Object(k.jsx)("option",{value:e.toLowerCase(),selected:(null===J||void 0===J||null===(t=J.data)||void 0===t?void 0:t.genre)===e.toLowerCase(),children:e})}))]})]})]}),Object(k.jsx)("div",{children:Object(k.jsx)("textarea",{className:"profile__text-area",id:"poem",name:"poem",required:!0,placeholder:"Insert your poem here",value:j,onChange:function(e){return U(e.target.value,m)}})}),Object(k.jsx)("button",{className:"profile__send-poem",type:"submit",onClick:function(e){R.setState({elementToEdit:""})},children:"Reset"}),Object(k.jsx)("button",{className:"profile__send-poem",type:"submit",onClick:function(e){e.preventDefault();var t=new Date,n=t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate()+" "+t.getHours()+":"+t.getMinutes()+":"+t.getSeconds();R.elementToEdit?(R.userId===R.adminId?B.mutate({poem:{userId:O,poem:j,title:v,genre:S,likes:0!==T.length?Object(P.a)(null===T||void 0===T?void 0:T.split(",")):[],date:n},poemId:J.data.id}):B.mutate({poem:{poem:j,title:v,genre:S,likes:[],date:n},poemId:J.data.id}),R.setState({elementToEdit:""})):(R.userId===R.adminId?D.mutate({userId:O,poem:j,title:v,genre:S,likes:0!==T.length?Object(P.a)(null===T||void 0===T?void 0:T.split(",")):[],date:n}):D.mutate({poem:j,title:v,genre:S,likes:[],date:n}),m(""),g(""),C(""))},children:"Send"})]})]})})]}),Object(k.jsx)("section",{className:"profile__outro",children:Object(k.jsxs)("div",{className:"profile__tabs",children:[Object(k.jsx)(be.a,{position:"static",color:"default",children:Object(k.jsxs)(he.a,{value:r,onChange:function(e,t){o(t)},indicatorColor:"primary",textColor:"primary",variant:"fullWidth","aria-label":"full width tabs example",children:[Object(k.jsx)(Oe.a,Object(i.a)({label:"My poems"},ye(0))),Object(k.jsx)(Oe.a,Object(i.a)({label:"My favourite poems"},ye(1)))]})}),Object(k.jsxs)(je.a,{axis:"rtl"===t.direction?"x-reverse":"x",index:r,onChangeIndex:function(e){o(e)},children:[Object(k.jsx)(ke,{className:"profile__myPoems",value:r,index:0,dir:t.direction,children:Object(k.jsx)(xe,{})}),Object(k.jsx)(ke,{className:"profile__myPoems",value:r,index:1,dir:t.direction,children:Object(k.jsx)(ge,{})})]})]})})]}):null})}n(208);var Ce=function(){Object(d.f)();var e=Object(a.useState)(""),t=Object(l.a)(e,2),n=t[0],c=t[1],s=Object(a.useState)(""),r=Object(l.a)(s,2),i=r[0],o=r[1],j=function(){Object(I.useQueryClient)();var e=Object(d.f)();return Object(I.useMutation)((function(e){return w.a.post("/api/login",e).then((function(e){return e.data}))}),{onSuccess:function(t){window.localStorage.setItem("loggedUser",JSON.stringify(t)),e.push("profile")},onError:function(e){console.log("something went wrong")}})}();return Object(k.jsxs)("form",{className:"login",onSubmit:function(e){e.preventDefault(),j.mutate({username:n,password:i}),c(""),o("")},children:[Object(k.jsx)("label",{children:'Introduce your login credentials or click "Register" if you don\'t have them'}),Object(k.jsx)("div",{className:"login__username",children:Object(k.jsx)("input",{type:"text",value:n,name:"Username",placeholder:"Username",onChange:function(e){return c(e.target.value)}})}),Object(k.jsx)("div",{className:"login__password",children:Object(k.jsx)("input",{type:"password",value:i,name:"Password",placeholder:"Password",onChange:function(e){return o(e.target.value)}})}),Object(k.jsx)("button",{children:"Login"}),Object(k.jsx)(u.c,{to:"/register",children:"Register"})]})};n(209);var we=function(){var e=Object(a.useState)(""),t=Object(l.a)(e,2),n=t[0],c=t[1],s=Object(a.useState)(""),r=Object(l.a)(s,2),i=r[0],o=r[1],j=Object(a.useState)(""),m=Object(l.a)(j,2),b=m[0],h=m[1],O=function(){Object(I.useQueryClient)();var e=Object(d.f)();return Object(I.useMutation)((function(e){return w.a.post("/api/register",e).then((function(e){return e.data}))}),{onSuccess:function(t){e.push("/login")},onError:function(e){console.log("something went wrong")}})}();return Object(k.jsxs)("form",{className:"register",onSubmit:function(e){e.preventDefault(),O.mutate({username:n,email:i,password:b})},children:[Object(k.jsx)("label",{children:'Introduce your new credentials or click "Login" if you already have them'}),Object(k.jsx)("div",{className:"register__username",children:Object(k.jsx)("input",{type:"text",value:n,name:"Username",placeholder:"Username",onChange:function(e){var t=e.target;return c(t.value)}})}),Object(k.jsx)("div",{className:"register__email",children:Object(k.jsx)("input",{type:"text",value:i,name:"Email",placeholder:"Email",onChange:function(e){var t=e.target;return o(t.value)}})}),Object(k.jsx)("div",{className:"register__password",children:Object(k.jsx)("input",{type:"password",value:b,name:"Password",placeholder:"Password",onChange:function(e){var t=e.target;return h(t.value)}})}),Object(k.jsx)("button",{children:"Register"}),Object(k.jsx)(u.c,{to:"/login",children:"Login"})]})};var Ie=function(e){return Object(k.jsx)("main",{className:"page-not-found__container",children:Object(k.jsxs)("section",{className:"page-not-found__message",children:[Object(k.jsx)("h1",{className:"page-not-found__title",children:"Error - 404"}),Object(k.jsx)("p",{className:"page-not-found__text",children:"Nothing to see here"}),Object(k.jsx)(u.b,{className:"page-not-found__link",to:"/",children:"Back to Dashboard"})]})})},Ee=["setState"],Le=c.a.createContext();var Te=function(e){var t=Object(a.useState)({elementToEdit:"",user:null,userId:"",username:"",config:{},adminId:"6172f315eb48b69ac1f015dc",setState:function(e){e.setState;var t=Object(o.a)(e,Ee),n=Object(i.a)(Object(i.a)({},c),t);s(n)}}),n=Object(l.a)(t,2),c=n[0],s=n[1];return Object(k.jsx)(Le.Provider,{value:c,children:Object(k.jsx)(u.a,{children:Object(k.jsxs)("div",{className:"container",children:[Object(k.jsx)(ue,{}),Object(k.jsx)("div",{className:"margin-body",children:Object(k.jsxs)(d.c,{children:[Object(k.jsx)(d.a,{path:"/",exact:!0,component:ne}),Object(k.jsx)(d.a,{path:"/profile",component:Se}),Object(k.jsx)(d.a,{path:"/login",component:Ce}),Object(k.jsx)(d.a,{path:"/register",component:we}),Object(k.jsx)(d.a,{path:"/:genre",exact:!0,component:ne}),Object(k.jsx)(d.a,{path:"/detail/:poemId",exact:!0,component:re}),Object(k.jsx)(d.a,{component:Ie})]})})]})})})};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var Ae=n(136);var Pe=Object({NODE_ENV:"production",PUBLIC_URL:"",WDS_SOCKET_HOST:void 0,WDS_SOCKET_PATH:void 0,WDS_SOCKET_PORT:void 0,FAST_REFRESH:!0,REACT_APP_AUTH0_DOMAIN:"dev-kpid04y3.eu.auth0.com",REACT_APP_AUTH0_CLIENTID:"A9LJVea7ss5WV8pjbW1505492DGyqosI",REACT_APP_ADMIN:"6172f315eb48b69ac1f015dc"}),De=(Pe.REACT_APP_AUTH0_DOMAIN,Pe.REACT_APP_AUTH0_CLIENTID,new I.QueryClient);r.a.render(Object(k.jsx)(c.a.StrictMode,{children:Object(k.jsxs)(I.QueryClientProvider,{client:De,children:[Object(k.jsx)(Te,{}),Object(k.jsx)(Ae.ReactQueryDevtools,{})]})}),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))},40:function(e,t,n){},61:function(e,t,n){},73:function(e,t,n){},74:function(e,t,n){}},[[210,1,2]]]);
//# sourceMappingURL=main.62cef933.chunk.js.map