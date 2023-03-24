export default {
	myVar1: [],
	myVar2: {},

	getStats: async () => {
		let estimates = [0.5, 1, 2, 3, 5, 8];
		var stats = [];
		for(var i=0; i<estimates.length; i++){
			var cycleTimesData = await GetCycleTimes.run({estimate: estimates[i]});
			var data = await this.getCycleTimes();
			console.log(data);
			var cycleTimes = data.map(item => item.cycleTime);
			var calculations = await this.doCalculations(cycleTimes);
			/*
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
			*/
			stats.push({
				"estimate":estimates[i],
				"sampleSize":data.length,
				"mean":calculations.mean,
				"median":calculations.median,
				"stdDev":calculations.stdDev
			}
								);
		}
		storeValue('stats',stats);
		return stats;
	},
	doCalculations: async (numbers) => {
  // calculate mean
  const mean = numbers.reduce((acc, cur) => acc + cur, 0) / numbers.length;

  // calculate median
  const sortedNumbers = numbers.slice().sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedNumbers.length / 2);
  const median = sortedNumbers.length % 2 === 0 ? (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2 : sortedNumbers[middleIndex];

  // calculate standard deviation
  const variance = numbers.reduce((acc, cur) => acc + Math.pow(cur - mean, 2), 0) / numbers.length;
  const standardDeviation = Math.sqrt(variance);

  return { "mean": mean, "median": median, "stdDev": standardDeviation };
	},
	getCycleTimes: async () => {
		let cycleTimes = [];
		var data = GetCycleTimes.data.data.searchClosedIssues.nodes;
		console.log("new object "+ new Date("2023-02-01T00:00:00Z"));
		console.log("selected date "+StartDate.selectedDate);
		for(var i=0; i<data.length; i++){
			var timelineItems = data[i].timelineItems.nodes;
			for(var j=0; j<timelineItems.length; j++){
				if(timelineItems[j].key==="issue.change_pipeline" && timelineItems[j].data.to_pipeline.name==="In Progress" && timelineItems[j].data.workspace.name==="Data Integration Pod" && new Date(data[i].closedAt)>=new Date("2023-02-01T00:00:00Z")){
					//				if(timelineItems[j].key==="issue.change_pipeline" && timelineItems[j].data.to_pipeline.name==="In Progress" && timelineItems[j].data.workspace.name==="Data Integration Pod" && new Date(data[i].closedAt)>=StartDate.selectedDate){
					cycleTimes.push({
						"number":data[i].number,
						"startedAt":timelineItems[j].updatedAt,
						"closedAt":data[i].closedAt,
						"cycleTime":this.getDiff(new Date(timelineItems[j].updatedAt),new Date(data[i].closedAt))
					}
												 );
				}
			}
		}
		return cycleTimes;
	},

	getDiff: (startDate, endDate) =>{
		const diffTime = Math.abs(endDate - startDate);
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
	}
}