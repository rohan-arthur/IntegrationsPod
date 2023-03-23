export default {
	myVar1: [],
	myVar2: {},
	myFun1: () => {
		var threePointersData = L.data;
		return threePointersData.data.searchClosedIssues.nodes;
	},
	getStats: () =>{
		let estimates = [0.5, 1, 2, 3, 5, 8];
		for(var i=1; i<estimates.length; i++){
			console.log(i);
		//	return XS.data;
		}
		
		var data = this.getCycleTimes();
		// Calculate mean
		const sum = data.reduce((acc, item) => acc + item.cycleTime, 0);
		const mean = sum / data.length;

		// Calculate median
		const sortedData = data.map(item => item.cycleTime).sort();
		const middle = Math.floor(sortedData.length / 2);
		const median = sortedData.length % 2 === 0 ? (sortedData[middle - 1] + sortedData[middle]) / 2 : sortedData[middle];

		// Calculate standard deviation
		const squaredDiffs = data.map(item => Math.pow(item.cycleTime - mean, 2));
		const variance = squaredDiffs.reduce((acc, item) => acc + item, 0) / data.length;
		const stdDev = Math.sqrt(variance);
		
		return (new Object({
						"sampleSize":data.length,
						"mean": mean,
						"median": median,
						"stdDev": stdDev
						}));
	},
	getCycleTimes: () => {
		let cycleTimes = [];
		var threePointersData = L.data.data.searchClosedIssues.nodes;
		for(var i=0; i<threePointersData.length; i++){
			var timelineItems = threePointersData[i].timelineItems.nodes;
			for(var j=0; j<timelineItems.length; j++){
				if(timelineItems[j].key==="issue.change_pipeline" && timelineItems[j].data.to_pipeline.name==="In Progress" && timelineItems[j].data.workspace.name==="Data Integration Pod" && new Date(threePointersData[i].closedAt)>=new Date("2023-02-01T00:00:00Z")){
					cycleTimes.push({
						"number":threePointersData[i].number,
						"startedAt":timelineItems[j].updatedAt,
						"closedAt":threePointersData[i].closedAt,
						"cycleTime":this.getDiff(new Date(timelineItems[j].updatedAt),new Date(threePointersData[i].closedAt))
					});
				}
			}
		}
		return cycleTimes;
	},
	getDiff: (startDate,endDate) =>{
		const diffTime = Math.abs(endDate - startDate);
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	},
	getDiffTest: () => {
		
	},
	myFun2: async () => {
		//use async-await or promises
	}
}