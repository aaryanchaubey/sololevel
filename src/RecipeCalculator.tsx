import {useState} from 'react';
import type {FoodEntry} from './types';
import {IFCT_FOODS,IFCT_SOURCE} from './data/ifctFoods';

type Ingredient={code:string;grams:number};
type Props={date:string;onSave:(entry:FoodEntry)=>void};
const round=(value:number,digits=1)=>Number(value.toFixed(digits));

export default function RecipeCalculator({date,onSave}:Props){
 const [name,setName]=useState('');const [servings,setServings]=useState(2);const [selectedCode,setSelectedCode]=useState(IFCT_FOODS[0]?.code??'');const [grams,setGrams]=useState(100);const [ingredients,setIngredients]=useState<Ingredient[]>([]);
 const selected=IFCT_FOODS.find(food=>food.code===selectedCode);
 const servingsForMath=Math.max(1,Math.floor(Number.isFinite(servings)?servings:1));
 const addIngredient=()=>{if(selected&&Number.isFinite(grams)&&grams>0)setIngredients(items=>[...items,{code:selected.code,grams:Number(grams)}]);};
 const totals=ingredients.reduce((sum,row)=>{const food=IFCT_FOODS.find(item=>item.code===row.code);if(!food)return sum;const factor=row.grams/100;return {grams:sum.grams+row.grams,kcal:sum.kcal+food.kcal*factor,protein:sum.protein+food.protein*factor,carbs:sum.carbs+food.carbs*factor,fat:sum.fat+food.fat*factor,fibre:sum.fibre+food.fibre*factor};},{grams:0,kcal:0,protein:0,carbs:0,fat:0,fibre:0});
 const hasCalcium=ingredients.length>0&&ingredients.every(row=>IFCT_FOODS.find(item=>item.code===row.code)?.calciumMg!==undefined);
 const hasIron=ingredients.length>0&&ingredients.every(row=>IFCT_FOODS.find(item=>item.code===row.code)?.ironMg!==undefined);
 const calcium=hasCalcium?ingredients.reduce((sum,row)=>sum+(IFCT_FOODS.find(item=>item.code===row.code)?.calciumMg??0)*row.grams/100,0)/servingsForMath:undefined;
 const iron=hasIron?ingredients.reduce((sum,row)=>sum+(IFCT_FOODS.find(item=>item.code===row.code)?.ironMg??0)*row.grams/100,0)/servingsForMath:undefined;
 const valid=!!name.trim()&&ingredients.length>0&&Number.isFinite(servings)&&servings>0;
 const save=()=>{if(!valid)return;const codes=[...new Set(ingredients.map(item=>item.code))];onSave({id:crypto.randomUUID(),date,food:name.trim(),portion:`${round(totals.grams/servingsForMath)} g estimated ingredient weight`,calories:Math.round(totals.kcal/servingsForMath),proteinGrams:round(totals.protein/servingsForMath),carbohydrateGrams:round(totals.carbs/servingsForMath),fatGrams:round(totals.fat/servingsForMath),fibreGrams:round(totals.fibre/servingsForMath),micronutrients:{calciumMg:calcium===undefined?undefined:round(calcium),ironMg:iron===undefined?undefined:round(iron)},preparation:'recipe',ingredients:ingredients.map(row=>`${IFCT_FOODS.find(item=>item.code===row.code)?.name??row.code} ${row.grams} g (IFCT ${row.code})`).join('; '),source:'Calculated from ICMR-NIN IFCT 2017 Tables 1 and 5',sourceFoodCodes:codes,nutritionConfidence:'calculated-from-ifct'});setName('');setIngredients([]);};
 return <section className="panel module-form recipe-calculator"><h2>Recipe calculator</h2><p className="muted">Add measured ingredients from the IFCT catalog. Nutrition is summed from each ingredient and divided by servings. Ingredient weights are used as entered; added water, cooking changes and nutrient loss are not modelled.</p>
  <div className="form-grid"><label className="field-label">Recipe name<input value={name} onChange={event=>setName(event.target.value)} placeholder="e.g. Dal and rice"/></label><label className="field-label">Servings<input type="number" min="1" step="1" value={servings} onChange={event=>setServings(Number(event.target.value))}/></label></div>
  <div className="form-grid"><label className="field-label">Ingredient<select value={selectedCode} onChange={event=>setSelectedCode(event.target.value)}>{IFCT_FOODS.map(food=><option key={food.code} value={food.code}>{food.name} · IFCT {food.code}</option>)}</select></label><label className="field-label">Amount (g)<input type="number" min="1" step="1" value={grams} onChange={event=>setGrams(Number(event.target.value))}/></label></div>
  <button type="button" onClick={addIngredient}>Add ingredient</button>
  {ingredients.length>0&&<div className="recipe-ingredients"><h3>Ingredients · {round(totals.grams)} g total</h3>{ingredients.map((row,index)=>{const food=IFCT_FOODS.find(item=>item.code===row.code);return <div className="history-row" key={`${row.code}-${index}`}><span>{food?.name} · {row.grams} g</span><small>IFCT {row.code}</small><button type="button" aria-label={`Remove ${food?.name??row.code}`} onClick={()=>setIngredients(items=>items.filter((_,itemIndex)=>itemIndex!==index))}>Remove</button></div>;})}</div>}
  <p className="muted">Per serving: {valid?`${Math.round(totals.kcal/servingsForMath)} kcal · ${round(totals.protein/servingsForMath)} g protein · ${round(totals.carbs/servingsForMath)} g carbs · ${round(totals.fat/servingsForMath)} g fat · ${round(totals.fibre/servingsForMath)} g fibre`:'Add ingredients and enter a recipe name to see totals.'}</p>
  <p className="muted">Micronutrients per serving: calcium {calcium===undefined?'not available for every ingredient':`${round(calcium)} mg`} · iron {iron===undefined?'not available for every ingredient':`${round(iron)} mg`}. Values are table means, not lab analysis.</p>
  <p className="muted">Reference: <a href={IFCT_SOURCE} target="_blank" rel="noreferrer">ICMR-NIN Indian Food Composition Tables ↗</a></p><button className="primary" type="button" onClick={save} disabled={!valid}>Save recipe per serving</button>
 </section>;
}
