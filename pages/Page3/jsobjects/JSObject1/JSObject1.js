export default {
	myVar1: [],
	myVar2: {},
	
	getDurations: async () =>{
		let estimates = [0.5, 1, 2, 3, 5, 8];
		var durations = [];
		for(var i=0; i<estimates.length; i++){
			var cycleTimesData = await GetData.run({estimate: estimates[i]});
		}
																					
	},
	getTransitions: async () => {
		
	}
}