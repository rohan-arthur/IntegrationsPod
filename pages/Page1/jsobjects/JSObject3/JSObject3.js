export default {
	myVar1: [],
	myVar2: {},
	myFun1: () => {
		let estimates = [0.5, 1, 2, 3, 5, 8];
		for(var i=0; i<estimates.length; i++){
			Api1.run({ estimate: i });
			//let dataz = Api1.data;
			console.log(estimates[i]+ " "+Api1.data.data.searchClosedIssues.totalCount);
		}
		console.log("ran");
		return Api1.data;
	},
	myFun2: async () => {
		let estimates = [0.5, 1, 2, 3, 5, 8]
		for(var i=0; i<estimates.length; i++){
			await Api1.run({ estimate: 1}); //estimates[i] });
			return Api1.data;
			//console.log(estimates[i]+ " "+Api1.data.data.searchClosedIssues.totalCount);
		}
	}
}