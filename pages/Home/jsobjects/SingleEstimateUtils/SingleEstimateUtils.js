export default {
	myVar1: [],
	myVar2: {},
	myFun1: () => {
		//write code here
	},
	getStats: async () => {
		let estimate = List1.triggeredItem.estimate;
		var cycleTimesData = await GetCycle_onSelection.run({estimate: estimate});
		var data = await this.getCycleTimes();
		storeValue('statsForEstimate',data);
	},
	getCycleTimes: async () => {
		let cycleTimes = [];
		let issuesForEstimate = [];
		var data = GetCycle_onSelection.data.data.searchClosedIssues.nodes;

		for(var i=0; i<data.length; i++){
			var timelineItems = data[i].timelineItems.nodes;
			for(var j=0; j<timelineItems.length; j++){
				//if(timelineItems[j].key==="issue.change_pipeline" && timelineItems[j].data.to_pipeline.name==="In Progress" && timelineItems[j].data.workspace.name==="Data Integration Pod" && new Date(data[i].closedAt)>=new Date("2023-02-01T00:00:00Z")){
				if(timelineItems[j].key==="issue.change_pipeline" && timelineItems[j].data.to_pipeline.name==="In Progress" && timelineItems[j].data.workspace.name==="Data Integration Pod" && new Date(data[i].closedAt)>=new Date(StartDate.selectedDate) && new Date(data[i].closedAt)<=new Date(EndDate.selectedDate)){
					issuesForEstimate.push(data[i]);
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
		//start: remove_duplicates
		//return cycleTimes;
		const unduplicatedCycleTimes = Object.values(cycleTimes.reduce((acc, curr) => {
			if (!acc[curr.number] || acc[curr.number].cycleTime > curr.cycleTime) {
				acc[curr.number] = curr;
			}
			return acc;
		}, {}));
		//end: remove_duplicates
		storeValue("issuesForEstimate",issuesForEstimate);
		return unduplicatedCycleTimes;
	},




	getDiff: (startDate, endDate) =>{
		if(startDate===undefined || endDate===undefined)
			return undefined;
		else{
			const diffTime = Math.abs(endDate - startDate);
			return Math.ceil(diffTime / (1000 * 60 * 60 * 24));			
		}
	},

	getInternalCycleTimes: () => {
		const data = appsmith.store.issuesForEstimate;
		let timelines = [];

		for(let i=0; i<data.length;i++){
			timelines.push({
				"number": data[i].number,
				"closedAt": data[i].closedAt,
				"transitions":[]
			});
			const timelineItems = data[i].timelineItems.nodes.filter(obj => obj.key === "issue.change_pipeline");

			for(let j=0;j< timelineItems.length;j++){
				//issue first came into in progress column	
				if(timelineItems[j].data.from_pipeline.name==="Sprint Backlog" && timelineItems[j].data.to_pipeline.name==="In Progress"){
					timelines[i].transitions.push(
						{
							"from":"Sprint Backlog",
							"to":"In Progress",
							"updatedAt":timelineItems[j].updatedAt
						}
					);
				}
				//and so on, for other transitions
				if(timelineItems[j].data.from_pipeline.name==="In Progress" && timelineItems[j].data.to_pipeline.name==="Code Review"){
					timelines[i].transitions.push(
						{
							"from":"In Progress",
							"to":"Code Review",
							"updatedAt":timelineItems[j].updatedAt
						}
					);
				}
				if(timelineItems[j].data.from_pipeline.name==="Code Review" && timelineItems[j].data.to_pipeline.name==="Needs QA"){
					timelines[i].transitions.push(
						{
							"from":"Code Review",
							"to":"Needs QA",
							"updatedAt":timelineItems[j].updatedAt
						}
					);
				}
				if(timelineItems[j].data.from_pipeline.name==="Needs QA" && timelineItems[j].data.to_pipeline.name==="QA In Progress"){
					timelines[i].transitions.push(
						{
							"from":"Needs QA",
							"to":"QA In Progress",
							"updatedAt":timelineItems[j].updatedAt
						}
					);
				}
				if(timelineItems[j].data.from_pipeline.name==="QA In Progress" && timelineItems[j].data.to_pipeline.name==="Ready for Merge"){
					timelines[i].transitions.push(
						{
							"from":"QA In Progress",
							"to":"Ready for Merge",
							"updatedAt":timelineItems[j].updatedAt
						}
					);
					timelines[i].transitions.push(
						{
							"from":"Ready for Merge",
							"to":"Closed",
							"updatedAt":data[i].closedAt
						}
					);
				}
			}
		}
		const filteredTimelines = timelines.filter((obj) => obj.transitions.some((t) => t.to === "Closed"));
		let issueBottlenecks = [];
		for(let k=0;k<filteredTimelines.length;k++){
			var inProgressStart = filteredTimelines[k].transitions.find((timeline) => {
				return timeline.from === "Sprint Backlog" && timeline.to === "In Progress";
			});

			var codeReviewStart = filteredTimelines[k].transitions.find((timeline) => {
				return timeline.from === "In Progress" && timeline.to === "Code Review";
			});

			var needsQAStart = filteredTimelines[k].transitions.find((timeline) => {
				return timeline.from === "Code Review" && timeline.to === "Needs QA";
			});

			var qaInProgressStart = filteredTimelines[k].transitions.find((timeline) => {
				return timeline.from === "Needs QA" && timeline.to === "QA In Progress";
			});

			var readyForMergeStart = filteredTimelines[k].transitions.find((timeline) => {
				return timeline.from === "QA In Progress" && timeline.to === "Ready for Merge";
			});

			var readyForMergeClose = filteredTimelines[k].transitions.find((timeline) => {
				return timeline.from === "Ready for Merge" && timeline.to === "Closed";
			});

			issueBottlenecks.push(
				{
					"number":filteredTimelines[k].number,
					"closedAt":new Date(filteredTimelines[k].closedAt),
					"inProgressTime":this.getDiff(new Date(inProgressStart?.updatedAt),new Date(codeReviewStart?.updatedAt)),
					"codeReviewTime":this.getDiff(new Date(codeReviewStart?.updatedAt),new Date(needsQAStart?.updatedAt)),
					"qaQueueTime":this.getDiff(new Date(needsQAStart?.updatedAt),new Date(qaInProgressStart?.updatedAt)),
					"qaTime":this.getDiff(new Date(qaInProgressStart?.updatedAt),new Date(readyForMergeStart?.updatedAt)),
					"mergeTime":this.getDiff(new Date(readyForMergeStart?.updatedAt),new Date(readyForMergeClose?.updatedAt))
				}
			)
		}
		const filteredArr = issueBottlenecks.filter((obj, index, self) =>
																								index === self.findIndex((o) => o.number === obj.number)
																							 );
		storeValue("issueBottlenecks",filteredArr);
		//const cycleCalculations = this.doCalculations(issueBottlenecks);
		//storeValue("cycleCalculations",cycleCalculations);
		return filteredArr;
	},

	doCalculations: (data) => {
		console.log(data);
		/*const data = [
    {
      "number": 20533,
      "closedAt": "2023-04-06T18:30:05Z",
      "inProgressTime": 2,
      "codeReviewTime": 5,
      "qaQueueTime": 1,
      "qaTime": 8,
      "mergeTime": 1
    },
    {
      "number": 20533,
      "closedAt": "2023-04-06T18:30:05Z",
      "inProgressTime": 2,
      "codeReviewTime": 5,
      "qaQueueTime": 1,
      "qaTime": 8,
      "mergeTime": 1
    },
    {
      "number": 21074,
      "closedAt": "2023-04-04T08:13:53Z",
      "inProgressTime": 2,
      "codeReviewTime": 7,
      "qaQueueTime": 2,
      "qaTime": 5,
      "mergeTime": 1
    },
    {
      "number": 21074,
      "closedAt": "2023-04-04T08:13:53Z",
      "inProgressTime": 2,
      "codeReviewTime": 7,
      "qaQueueTime": 2,
      "qaTime": 5,
      "mergeTime": 1
    },
    {
      "number": 21074,
      "closedAt": "2023-04-04T08:13:53Z",
      "inProgressTime": 2,
      "codeReviewTime": 7,
      "qaQueueTime": 2,
      "qaTime": 5,
      "mergeTime": 1
    },
    {
      "number": 17324,
      "closedAt": "2023-03-29T11:41:46Z",
      "inProgressTime": null,
      "codeReviewTime": null,
      "qaQueueTime": null,
      "qaTime": 3,
      "mergeTime": 1
    },
    {
      "number": 20163,
      "closedAt": "2023-03-08T05:25:19Z",
      "inProgressTime": 21,
      "codeReviewTime": 5,
      "qaQueueTime": 4,
      "qaTime": 8,
      "mergeTime": 2
    },
    {
      "number": 20163,
      "closedAt": "2023-03-08T05:25:19Z",
      "inProgressTime": 21,
      "codeReviewTime": 5,
      "qaQueueTime": 4,
      "qaTime": 8,
      "mergeTime": 2
    },
    {
      "number": 15253,
      "closedAt": "2023-03-03T12:21:05Z",
      "inProgressTime": 201,
      "codeReviewTime": 2,
      "qaQueueTime": 1,
      "qaTime": 2,
      "mergeTime": 1
    },
    {
      "number": 19893,
      "closedAt": "2023-02-10T10:41:20Z",
      "inProgressTime": null,
      "codeReviewTime": null,
      "qaQueueTime": null,
      "qaTime": 1,
      "mergeTime": 1
    }
  ];*/
		// Calculate the mean of the inProgressTime field
		const inProgressMean = data.reduce((acc, curr) => acc + (curr.inProgressTime || 0), 0) / data.length;

		// Calculate the mean of the codeReviewTime field
		const codeReviewMean = data.reduce((acc, curr) => acc + (curr.codeReviewTime || 0), 0) / data.length;

		// Calculate the mean of the qaQueueTime field
		const qaQueueMean = data.reduce((acc, curr) => acc + curr.qaQueueTime, 0) / data.length;

		// Calculate the mean of the qaTime field
		const qaTimeMean = data.reduce((acc, curr) => acc + curr.qaTime, 0) / data.length;

		// Calculate the mean of the mergeTime field
		const mergeTimeMean = data.reduce((acc, curr) => acc + curr.mergeTime, 0) / data.length;

		// Calculate the median of the inProgressTime field
		const inProgressSorted = data.map((x) => x.inProgressTime).sort();
		const inProgressMedian = inProgressSorted.length % 2 === 0 ? (inProgressSorted[inProgressSorted.length / 2] + inProgressSorted[(inProgressSorted.length / 2) - 1]) / 2 : inProgressSorted[Math.floor(inProgressSorted.length / 2)];

		// Calculate the median of the codeReviewTime field
		const codeReviewSorted = data.map((x) => x.codeReviewTime).sort();
		const codeReviewMedian = codeReviewSorted.length % 2 === 0 ? (codeReviewSorted[codeReviewSorted.length / 2] + codeReviewSorted[(codeReviewSorted.length / 2) - 1]) / 2 : codeReviewSorted[Math.floor(codeReviewSorted.length / 2)];

		// Calculate the median of the qaQueueTime field
		const qaQueueSorted = data.map((x) => x.qaQueueTime).sort();
		const qaQueueMedian = qaQueueSorted.length % 2 === 0 ? (qaQueueSorted[qaQueueSorted.length / 2] + qaQueueSorted[(qaQueueSorted.length / 2) - 1]) / 2 : qaQueueSorted[Math.floor(qaQueueSorted.length / 2)];

		// Calculate the median of the qaTime field
		const qaTimeSorted = data.map((x) => x.qaTime).sort();
		const qaTimeMedian = qaTimeSorted.length % 2 === 0 ? (qaTimeSorted[qaTimeSorted.length / 2] + qaTimeSorted[(qaTimeSorted.length / 2) - 1]) / 2 : qaTimeSorted[Math.floor(qaTimeSorted.length / 2)];

		// Calculate the median of the mergeTime field
		const mergeTimeSorted = data.map((x) => x.mergeTime).sort();
		const mergeTimeMedian = mergeTimeSorted.length % 2 === 0 ? (mergeTimeSorted[mergeTimeSorted.length / 2] + mergeTimeSorted[(mergeTimeSorted.length / 2) - 1]) / 2 : mergeTimeSorted[Math.floor(mergeTimeSorted.length / 2)];

		// Calculate the standard deviation of the inProgressTime field
		const inProgressSD = Math.sqrt(data.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / data.length);

		// Calculate the standard deviation of the inProgressTime field
		const codeReviewSD = Math.sqrt(data.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / data.length);

		// Calculate the standard deviation of the inProgressTime field
		const qaQueueSD = Math.sqrt(data.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / data.length);

		// Calculate the standard deviation of the inProgressTime field
		const qaTimeSD = Math.sqrt(data.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / data.length);

		// Calculate the standard deviation of the inProgressTime field
		const mergeTimeSD = Math.sqrt(data.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / data.length);

		const result = [
			{
				"Queue":"In Progress",
				"Mean": inProgressMean,
				"Median": inProgressMedian,
				"StdDev": inProgressSD
			},
			{
				"Queue":"Code Review",
				"Mean": codeReviewMean,
				"Median": codeReviewMedian,
				"StdDev": codeReviewSD
			},
			{
				"Queue":"Waiting for QA",
				"Mean": qaQueueMean,
				"Median": qaQueueMedian,
				"StdDev": qaQueueSD
			},
			{
				"Queue":"QA Time",
				"Mean": qaTimeMean,
				"Median": qaTimeMedian,
				"StdDev": qaTimeSD
			},
			{
				"Queue":"Merge",
				"Mean": mergeTimeMean,
				"Median": mergeTimeMedian,
				"StdDev": mergeTimeSD
			}
		];

		return result;
	}
}