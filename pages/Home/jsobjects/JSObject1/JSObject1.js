export default {
	myVar1: [],
	myVar2: {},
	async myFun2 () {
		//	use async-await or promises
		//	await storeValue('varName', 'hello world')
	},
	
	getDiff: () =>{
		
		var startDate = "2023-04-06T14:12:38Z";
		var endDate;
		
		if(startDate===undefined || endDate===undefined)
			return null;
		else{
			const diffTime = Math.abs(endDate - startDate);
			return Math.ceil(diffTime / (1000 * 60 * 60 * 24));			
		}
	}
}