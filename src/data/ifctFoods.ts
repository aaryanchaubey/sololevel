export type FoodPreparation='raw'|'cooked'|'recipe'|'packaged';
export interface IFCTFood {
  code:string;name:string;preparation:FoodPreparation;regions:number;
  energyKj:number;kcal:number;protein:number;carbs:number;fat:number;fibre:number;
  calciumMg?:number;ironMg?:number;
}

// IFCT 2017 Table 1 mean values per 100 g edible portion. Energy is converted
// from the table's kJ using 1 kcal = 4.184 kJ. These are ingredients/foods as
// listed by IFCT; added oil, cooking water, recipe yield and branded products
// must be entered separately by the player.
export const IFCT_SOURCE='https://www.nin.res.in/ebooks/IFCT2017_16122024.pdf';
export const IFCT_FOODS:IFCTFood[]=[
  {code:'A001',name:'Amaranth seed, black',preparation:'raw',regions:1,energyKj:1490,kcal:356.1,protein:14.59,carbs:59.98,fat:5.74,fibre:7.02},
  {code:'A010',name:'Ragi (finger millet)',preparation:'raw',regions:5,energyKj:1342,kcal:320.7,protein:7.16,carbs:66.82,fat:1.92,fibre:11.18,calciumMg:364,ironMg:4.62},
  {code:'A011',name:'Rice flakes (poha), dry',preparation:'raw',regions:6,energyKj:1480,kcal:353.7,protein:7.44,carbs:76.75,fat:1.14,fibre:3.46,calciumMg:9.19,ironMg:4.46},
  {code:'A012',name:'Puffed rice (muri)',preparation:'packaged',regions:6,energyKj:1514,kcal:361.9,protein:7.47,carbs:77.68,fat:1.62,fibre:2.56,calciumMg:15.09,ironMg:4.55},
  {code:'A014',name:'Rice, parboiled and milled, dry',preparation:'raw',regions:6,energyKj:1471,kcal:351.6,protein:7.81,carbs:77.16,fat:0.55,fibre:3.74,calciumMg:8.11,ironMg:0.72},
  {code:'A015',name:'Rice, raw and milled, dry',preparation:'raw',regions:6,energyKj:1491,kcal:356.4,protein:7.94,carbs:78.24,fat:0.52,fibre:2.81,calciumMg:7.49,ironMg:0.65},
  {code:'A019',name:'Whole-wheat flour (atta), dry',preparation:'raw',regions:6,energyKj:1340,kcal:320.3,protein:10.57,carbs:64.17,fat:1.53,fibre:11.36,calciumMg:30.94,ironMg:4.10},
  {code:'A020',name:'Whole wheat grain, dry',preparation:'raw',regions:6,energyKj:1347,kcal:321.9,protein:10.59,carbs:64.72,fat:1.47,fibre:11.23,calciumMg:39.36,ironMg:3.97},
  {code:'B013',name:'Lentil dal, dry',preparation:'raw',regions:6,energyKj:1349,kcal:322.4,protein:24.35,carbs:52.53,fat:0.75,fibre:10.43,calciumMg:44.32,ironMg:7.06},
  {code:'B014',name:'Lentil, whole brown, dry',preparation:'raw',regions:6,energyKj:1251,kcal:299.0,protein:22.49,carbs:48.47,fat:0.64,fibre:16.82,calciumMg:76.13,ironMg:7.57},
  {code:'B017',name:'Dry peas',preparation:'raw',regions:6,energyKj:1269,kcal:303.3,protein:20.43,carbs:48.93,fat:1.89,fibre:17.01,calciumMg:75.11,ironMg:5.09},
  {code:'B019',name:'Rajmah, brown, dry',preparation:'raw',regions:6,energyKj:1245,kcal:297.6,protein:19.50,carbs:48.83,fat:1.68,fibre:16.95,calciumMg:134,ironMg:6.30},
  {code:'B021',name:'Red gram dal (toor/arhar), dry',preparation:'raw',regions:6,energyKj:1384,kcal:330.8,protein:21.70,carbs:55.23,fat:1.56,fibre:9.06,calciumMg:71.73,ironMg:3.90},
  {code:'C033',name:'Spinach, raw',preparation:'raw',regions:6,energyKj:102,kcal:24.4,protein:2.14,carbs:2.05,fat:0.64,fibre:2.38,calciumMg:82.29,ironMg:2.95},
  {code:'D043',name:'Cucumber, green, elongate, raw',preparation:'raw',regions:6,energyKj:82,kcal:19.6,protein:0.71,carbs:3.48,fat:0.16,fibre:2.14,calciumMg:16.39,ironMg:0.46},
  {code:'D059',name:'Papaya, raw',preparation:'raw',regions:6,energyKj:100,kcal:23.9,protein:0.50,carbs:4.40,fat:0.23,fibre:2.28,calciumMg:22.72,ironMg:0.20},
  {code:'D061',name:'Green peas, fresh, raw',preparation:'raw',regions:6,energyKj:340,kcal:81.3,protein:7.25,carbs:11.88,fat:0.13,fibre:6.32,calciumMg:28.24,ironMg:1.58},
  {code:'D075',name:'Tomato, ripe, hybrid, raw',preparation:'raw',regions:6,energyKj:79,kcal:18.9,protein:0.76,carbs:3.20,fat:0.25,fibre:1.58,calciumMg:8.90,ironMg:0.22},
  {code:'E012',name:'Banana, ripe, robusta',preparation:'raw',regions:6,energyKj:440,kcal:105.2,protein:1.23,carbs:23.63,fat:0.33,fibre:1.94,calciumMg:5.07,ironMg:0.28},
  {code:'E028',name:'Guava, white flesh, raw',preparation:'raw',regions:5,energyKj:135,kcal:32.3,protein:1.44,carbs:5.13,fat:0.32,fibre:8.59,calciumMg:18.52,ironMg:0.32},
];
