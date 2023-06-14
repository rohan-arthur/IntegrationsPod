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

		/*
		for(var i=0; i<data.length; i++){
			var timelineItems = data[i].timelineItems.nodes;
			for(var j=0; j<timelineItems.length; j++){
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
		}*/
		
		for(var i=0; i<data.length; i++){
			var allChangePipelineItems = data[i].timelineItems.nodes.filter(item => item.key === "issue.change_pipeline");
			var podChangedPipeLineItems = allChangePipelineItems.filter(item => item.data.workspace.name === "Data Integration Pod");
			var changedPipeLineItemsToProgress = podChangedPipeLineItems.filter(item => item.data.to_pipeline.name === "In Progress");
			for(var j=0; j<changedPipeLineItemsToProgress.length; j++){
				if(new Date(data[i].closedAt)>=new Date(StartDate.selectedDate) && new Date(data[i].closedAt)<=new Date(EndDate.selectedDate)){
					issuesForEstimate.push(data[i]);
					cycleTimes.push({
						"title":data[i].title,
						"number":data[i].number,
						"startedAt":changedPipeLineItemsToProgress[j].updatedAt,
						"closedAt":data[i].closedAt,
						"cycleTime":this.getDiff(new Date(changedPipeLineItemsToProgress[j].updatedAt),new Date(data[i].closedAt)),
						"assignee": data[i].assignees.nodes.length > 0 ? data[i].assignees.nodes[0].name : "No Assignee",
						"timelineItems": podChangedPipeLineItems.map(item => {
							return {
								"id": item.updatedAt,
								"from": item.data.from_pipeline.name,
								"to": item.data.to_pipeline.name,
								"timeStamp": (new Date(item.updatedAt)).toDateString(),
								"by": item.data.github_user.login 
							}
						})
					});
				}
			}
		}
		
		
		//start: remove_duplicates
		const unduplicatedCycleTimes = Object.values(cycleTimes.reduce((acc, curr) => {
			if (!acc[curr.number] || acc[curr.number].cycleTime > curr.cycleTime) {
				acc[curr.number] = curr;
			}
			return acc;
		}, {}));

		const unduplicatedIssues = Array.from(new Set(issuesForEstimate.map(obj => obj.number)))
		.map(number => {
			return issuesForEstimate.find(obj => obj.number === number);
		});
		//end: remove_duplicates
		storeValue("issuesForEstimate",unduplicatedIssues);
		return unduplicatedCycleTimes;
	},




	getDiff: (startDate, endDate) =>{
		if(!startDate || !endDate){
			return null;
		}
		else{
			const diffTime = Math.abs(endDate - startDate);
			return Math.ceil(diffTime / (1000 * 60 * 60 * 24));			
		}
	},


	//this function is worse than spaghetti - it is also simply wrong. Needs a complete rewrite.
	getInternalCycleTimes: async () => {
		const data = appsmith.store.issuesForEstimate;
		let timelines = [];

		for(let i=0; i<data.length;i++){
			timelines.push({
				"number": data[i].number,
				"closedAt": data[i].closedAt,
				"transitions":[]
			});

			const timelineItemsAcrossWorkspaces = data[i].timelineItems.nodes.filter(obj => obj.key === "issue.change_pipeline");
			const timelineItems = timelineItemsAcrossWorkspaces.filter(obj => obj.data.workspace.name === "Data Integration Pod" );

			for(let j=0;j< timelineItems.length;j++){
				//issue first came into in progress column	
				if(timelineItems[j].data.to_pipeline.name==="In Progress"){
					timelines[i].transitions.push(
						{
							"from":"Sprint Backlog",
							"to":"In Progress",
							"updatedAt": timelineItems[j].updatedAt
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
				if(timelineItems[j].data.from_pipeline.name==="QA In Progress" && (timelineItems[j].data.to_pipeline.name==="Ready for Merge" || timelineItems[j].data.to_pipeline.name==="QA Done")){
					timelines[i].transitions.push(
						{
							"from":"QA In Progress",
							"to":"QA Done",
							"updatedAt":timelineItems[j].updatedAt
						}
					);
					timelines[i].transitions.push(
						{
							"from":"QA Done",
							"to":"Closed",
							"updatedAt":data[i].closedAt
						}
					);
				}
			}
		}

		//		const closedTimelines = timelines.filter((obj) => obj.transitions.some((t) => t.to === "Closed"));

		const filteredTimelines = timelines.reduce((acc, item) => {
			const transitions = {};

			item.transitions.forEach((transition) => {
				const key = `${transition.from}-${transition.to}`;
				const existingTransition = transitions[key];

				if (!existingTransition || existingTransition.updatedAt < transition.updatedAt) {
					transitions[key] = transition;
				}
			});

			acc.push({ ...item, transitions: Object.values(transitions) });

			return acc;
		}, []);

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

			var qaDoneStart = filteredTimelines[k].transitions.find((timeline) => {
				return timeline.from === "QA In Progress" && (timeline.to === "Ready for Merge" || timeline.to === "QA Done");
			});

			var qaDoneClose = filteredTimelines[k].transitions.find((timeline) => {
				return (timeline.from === "Ready for Merge" || timeline.from === "QA Done") && timeline.to === "Closed";
			});

			issueBottlenecks.push(
				{
					"number":filteredTimelines[k].number,
					"closedAt":new Date(filteredTimelines[k].closedAt),
					"inProgressTime":(inProgressStart?.updatedAt && codeReviewStart?.updatedAt) ? this.getDiff(new Date(inProgressStart?.updatedAt),new Date(codeReviewStart?.updatedAt)) : 0,
					"codeReviewTime":(codeReviewStart?.updatedAt && needsQAStart?.updatedAt) ? this.getDiff(new Date(codeReviewStart?.updatedAt), new Date(needsQAStart?.updatedAt)) : 0, 
					"qaQueueTime":(needsQAStart?.updatedAt && qaInProgressStart?.updatedAt) ? this.getDiff(new Date(needsQAStart?.updatedAt),new Date(qaInProgressStart?.updatedAt)) : 0,
					"qaTime":(qaInProgressStart?.updatedAt && qaDoneStart?.updatedAt) ? this.getDiff(new Date(qaInProgressStart?.updatedAt),new Date(qaDoneStart?.updatedAt)) : 0,
					"mergeTime":(qaDoneStart?.updatedAt && qaDoneClose?.updatedAt) ? this.getDiff(new Date(qaDoneStart?.updatedAt),new Date(qaDoneClose?.updatedAt)) : 0
				}
			)
		}
		storeValue("issueBottlenecks",issueBottlenecks);
		const cycleCalculations = this.doCalculations(issueBottlenecks);
		storeValue("cycleCalculations",cycleCalculations);
		return cycleCalculations;
	},
	doCalculations: (data) => {
		const filteredData = data.filter(item => {
			return item.inProgressTime !== 0 || item.codeReviewTime !== 0 || item.qaQueueTime !== 0 || item.qaTime !== 0 || item.mergeTime !== 0;
		});
		// Calculate the mean of the inProgressTime field
		const inProgressMean = filteredData.reduce((acc, curr) => acc + (curr.inProgressTime || 0), 0) / filteredData.length;

		// Calculate the mean of the codeReviewTime field
		const codeReviewMean = filteredData.reduce((acc, curr) => acc + (curr.codeReviewTime || 0), 0) / filteredData.length;

		// Calculate the mean of the qaQueueTime field
		const qaQueueMean = filteredData.reduce((acc, curr) => acc + curr.qaQueueTime, 0) / filteredData.length;

		// Calculate the mean of the qaTime field
		const qaTimeMean = filteredData.reduce((acc, curr) => acc + curr.qaTime, 0) / filteredData.length;

		// Calculate the mean of the mergeTime field
		const mergeTimeMean = filteredData.reduce((acc, curr) => acc + curr.mergeTime, 0) / filteredData.length;

		// Calculate the median of the inProgressTime field
		const inProgressSorted = filteredData.map((x) => x.inProgressTime).sort();
		const inProgressMedian = inProgressSorted.length % 2 === 0 ? (inProgressSorted[inProgressSorted.length / 2] + inProgressSorted[(inProgressSorted.length / 2) - 1]) / 2 : inProgressSorted[Math.floor(inProgressSorted.length / 2)];

		// Calculate the median of the codeReviewTime field
		const codeReviewSorted = filteredData.map((x) => x.codeReviewTime).sort();
		const codeReviewMedian = codeReviewSorted.length % 2 === 0 ? (codeReviewSorted[codeReviewSorted.length / 2] + codeReviewSorted[(codeReviewSorted.length / 2) - 1]) / 2 : codeReviewSorted[Math.floor(codeReviewSorted.length / 2)];

		// Calculate the median of the qaQueueTime field
		const qaQueueSorted = filteredData.map((x) => x.qaQueueTime).sort();
		const qaQueueMedian = qaQueueSorted.length % 2 === 0 ? (qaQueueSorted[qaQueueSorted.length / 2] + qaQueueSorted[(qaQueueSorted.length / 2) - 1]) / 2 : qaQueueSorted[Math.floor(qaQueueSorted.length / 2)];

		// Calculate the median of the qaTime field
		const qaTimeSorted = filteredData.map((x) => x.qaTime).sort();
		const qaTimeMedian = qaTimeSorted.length % 2 === 0 ? (qaTimeSorted[qaTimeSorted.length / 2] + qaTimeSorted[(qaTimeSorted.length / 2) - 1]) / 2 : qaTimeSorted[Math.floor(qaTimeSorted.length / 2)];

		// Calculate the median of the mergeTime field
		const mergeTimeSorted = filteredData.map((x) => x.mergeTime).sort();
		const mergeTimeMedian = mergeTimeSorted.length % 2 === 0 ? (mergeTimeSorted[mergeTimeSorted.length / 2] + mergeTimeSorted[(mergeTimeSorted.length / 2) - 1]) / 2 : mergeTimeSorted[Math.floor(mergeTimeSorted.length / 2)];

		// Calculate the standard deviation of the inProgressTime field
		const inProgressSD = Math.sqrt(filteredData.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / filteredData.length);

		// Calculate the standard deviation of the inProgressTime field
		const codeReviewSD = Math.sqrt(filteredData.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / filteredData.length);

		// Calculate the standard deviation of the inProgressTime field
		const qaQueueSD = Math.sqrt(filteredData.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / filteredData.length);

		// Calculate the standard deviation of the inProgressTime field
		const qaTimeSD = Math.sqrt(filteredData.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / filteredData.length);

		// Calculate the standard deviation of the inProgressTime field
		const mergeTimeSD = Math.sqrt(filteredData.reduce((acc, curr) => acc + Math.pow(curr.inProgressTime - inProgressMean, 2), 0) / filteredData.length);

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