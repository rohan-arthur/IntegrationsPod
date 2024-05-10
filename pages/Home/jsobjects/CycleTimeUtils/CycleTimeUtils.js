export default {
	myVar1: [],
	myVar2: {},

	//in progress
	getImpactBasedCycleTimes: async () => {
		let cycleTimesByImpact = [];

		//const impact = ["Critical", "High", "medium", "Low"]; 
		const criticalIssuesData = await GetCriticalssues.run();
		const highIssuesData = await GetHighIssues.run();
		const mediumIssuesData = await GetMediumIssues.run();
		const lowIssuesData = await GetLowIssues.run();
		const masterData = [
			{
				"impact":"critical",
				"issues":criticalIssuesData
			},
			{
				"impact":"high",
				"issues":highIssuesData
			},
			{
				"impact":"medium",
				"issues":mediumIssuesData
			},
			{
				"impact":"low",
				"issues":lowIssuesData
			}
		];

		return masterData;
	},

	getStats: async () => {
		let estimates = [0.2, 0.5, 1, 2, 3, 5, 8];
		var stats = [];
		var globalCycleTimes = [];
		for(var i=0; i<estimates.length; i++){
			
			var data = await this.getCycleTimes(estimates);
			var cycleTimes = data.map(item => item.cycleTime);

			globalCycleTimes.push({"estimate":estimates[i],"durations":cycleTimes});

			var calculations = await this.doCalculations(cycleTimes);

			stats.push({
				"estimate":estimates[i],
				"sampleSize":data.length,
				"mean":calculations.mean,
				"median":calculations.median,
				"stdDev":calculations.stdDev,
				"minimum":calculations.minimum,
				"maximum":calculations.maximum
			}
								);
		}

		await storeValue('globalCycleTimes',globalCycleTimes);
		await storeValue('stats',stats);
		//return stats;
		return globalCycleTimes;
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

		const minimum = Math.min(...numbers);
		const maximum = Math.max(...numbers);

		return { "mean": mean, "median": median, "stdDev": standardDeviation, "minimum":minimum, "maximum":maximum };
	},
	getCycleTimes: async () => {
		let cycleTimes = [];
		const responseData = await GetCycleTimes.run({estimate: List1.selectedItem.estimate });
		
		var data = responseData.data.searchClosedIssues.nodes;

		for(var i=0; i<data.length; i++){
			var timelineItems = data[i].timelineItems.nodes;
			console.log("timelineItems", timelineItems);
			for(var j=0; j<timelineItems.length; j++){
				if(timelineItems[j]?.key==="issue.change_pipeline" && timelineItems[j]?.data.to_pipeline.name==="In Progress" && timelineItems[j].data.workspace.name==="Data Integration Pod" && new Date(data[i].closedAt)>=new Date(StartDate.selectedDate) && new Date(data[i].closedAt)<=new Date(EndDate.selectedDate)){
					cycleTimes.push({
						"number":data[i].number,
						"startedAt":timelineItems[j].updatedAt,
						"closedAt":data[i].closedAt,
						"cycleTime":this.getDiffWorkdays(new Date(timelineItems[j].updatedAt),new Date(data[i].closedAt))
					}
												 );
				}
			}
		}

		//start: remove_duplicates
		//return cycleTimes;
		const unduplicatedCycleTimes = Object.values(cycleTimes.reduce((acc, curr) => {
			if (!acc[curr.number] || acc[curr.number].cycleTime > curr.cycleTime) {
				acc[curr.number] = curr;
			}
			return acc;
		}, {}));
		return unduplicatedCycleTimes;
		//end: remove_duplicates
	},

	getDiff: (startDate, endDate) =>{
		const diffTime = Math.abs(endDate - startDate);
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
	},

	getDiffWorkdays: (startDate, endDate) =>{
		// Copy the start date for manipulation
		const currentDate = startDate;
		let count = 0;

		// Loop through each day between the start and end dates
		while (currentDate <= endDate) {
			const dayOfWeek = currentDate.getDay();

			// Check if the current day is not Saturday (6) or Sunday (0)
			if (dayOfWeek !== 6 && dayOfWeek !== 0) {
				count++;
			}

			// Move to the next day
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return count;
	}
	
}