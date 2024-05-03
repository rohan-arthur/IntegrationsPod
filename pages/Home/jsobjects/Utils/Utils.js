export default {
	myVar1: [],
	myVar2: {},
	loader: () => {
		storeValue('valocityClicked',false);
	},
	displayFiniteNumberOrNil(number){
		return Number.isFinite(number) ? number : "nil"
	},
	myFun2: async () => {
		//use async-await or promises
	}
}