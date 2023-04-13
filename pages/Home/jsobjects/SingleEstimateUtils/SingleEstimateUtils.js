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
		const diffTime = Math.abs(endDate - startDate);
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
	},
	
	
	
	
	getInternalCycleTimes: () => {
		var data = appsmith.store.issuesForEstimate;
		let timelines = [];

		for(let i=0; i<data.length; i++){
			var timelineItems = data[i].timelineItems.nodes;
			for(let j=0; j<timelineItems.length; j++){
				if(timelineItems[j].key==="issue.change_pipeline"){
					//in progress --> code review
					if(timelineItems[j].data.from_pipeline.name==="Sprint Backlog" && timelineItems[j].data.to_pipeline.name==="In Progress"){
						timelines.push(
							{
								"number": data[i].number,
								"from":"Sprint Backlog",
								"to":"In Progress",
								"updatedAt":timelineItems[j].updatedAt
							}
						)
					}else if(timelineItems[j].data.from_pipeline.name==="In Progress" && timelineItems[j].data.to_pipeline.name==="Code Review"){
						timelines.push(
							{
								"number": data[i].number,
								"from":"In Progress",
								"to":"Code Review",
								"updatedAt":timelineItems[j].updatedAt
							}
						)
					}else if(timelineItems[j].data.from_pipeline.name==="Code Review" && timelineItems[j].data.to_pipeline.name==="Needs QA"){
						timelines.push(
							{
								"number": data[i].number,
								"from":"Code Review",
								"to":"Needs QA",
								"updatedAt":timelineItems[j].updatedAt
							}
						)
					}else if(timelineItems[j].data.from_pipeline.name==="Needs QA" && timelineItems[j].data.to_pipeline.name==="QA In Progress"){
						timelines.push(
							{
								"number": data[i].number,
								"from":"Needs QA",
								"to":"QA In Progress",
								"updatedAt":timelineItems[j].updatedAt
							}
						)
					}else if(timelineItems[j].data.from_pipeline.name==="QA In Progress" && timelineItems[j].data.to_pipeline.name==="Ready for Merge"){
						timelines.push(
							{
								"number": data[i].number,
								"from":"QA In Progress",
								"to":"Ready for Merge",
								"updatedAt":timelineItems[j].updatedAt
							}
						)
					}else if(timelineItems[j].data.from_pipeline.name==="Ready for Merge"){
						timelines.push(
							{
								"number": data[i].number,
								"from":"Ready for Merge",
								"to":"Closed",
								"updatedAt":data[i].closedAt
							}
						)
					}
				}
			}
		}

		//return timelines;
		const filteredData = timelines.reduce((acc, current) => {
			const existingIndex = acc.findIndex(
				(item) =>
				item.number === current.number &&
				item.from === current.from &&
				item.to === current.to
			);

			if (existingIndex !== -1) {
				const existingItem = acc[existingIndex];
				if (current.updatedAt > existingItem.updatedAt) {
					acc[existingIndex] = current;
				}
			} else {
				acc.push(current);
			}

			return acc;
		}, []);

		//return filteredData;

		const issueTimelines = filteredData.reduce((acc, curr) => {
			const found = acc.find((item) => item.number === curr.number);
			if (found) {
				found.timelines.push(curr);
			} else {
				acc.push({
					number: curr.number,
					timelines: [curr]
				});
			}
			return acc;
		}, []);
		
		let issueBottleNecks = [];
		
		for(let k=0;k<issueTimelines.length;k++){
			var inProgressStart = issueTimelines[k].timelines.find((timeline) => {
				return timeline.from === "Sprint Backlog" && timeline.to === "In Progress";
			});
			
			var codeReviewStart = issueTimelines[k].timelines.find((timeline) => {
				return timeline.from === "In Progress" && timeline.to === "Code Review";
			});
			
			var needsQAStart = issueTimelines[k].timelines.find((timeline) => {
				return timeline.from === "Code Review" && timeline.to === "Needs QA";
			});
			
			var qaInProgressStart = issueTimelines[k].timelines.find((timeline) => {
				return timeline.from === "Needs QA" && timeline.to === "QA In Progress";
			});
			
			var readyForMergeStart = issueTimelines[k].timelines.find((timeline) => {
				return timeline.from === "QA In Progress" && timeline.to === "Ready for Merge";
			});
			
			var readyForMergeClose = issueTimelines[k].timelines.find((timeline) => {
				return timeline.from === "Ready for Merge" && timeline.to === "Closed";
			});
			
			var timeInProgress, timeInReview, timeInQAQueue, timeInQATests, timeInMergeQueue;
			
			
			if(inProgressStart && codeReviewStart){
				timeInProgress = this.getDiff(new Date(inProgressStart.updatedAt),new Date(codeReviewStart.updatedAt));
			}
			if(codeReviewStart && needsQAStart){
				timeInReview = this.getDiff(new Date(codeReviewStart.updatedAt),new Date(needsQAStart.updatedAt));
			}
			if(needsQAStart && qaInProgressStart){
				timeInQAQueue = this.getDiff(new Date(needsQAStart.updatedAt),new Date(qaInProgressStart.updatedAt));
			}
			if(qaInProgressStart && readyForMergeStart){
				timeInQATests = this.getDiff(new Date(qaInProgressStart.updatedAt),new Date(readyForMergeStart));
			}
			if(readyForMergeStart && readyForMergeClose){
				timeInMergeQueue = this.getDiff(new Date(readyForMergeStart.updatedAt),new Date(readyForMergeClose.updatedAt));
			}
			
			issueBottleNecks.push(
				{
					"number": issueTimelines[k].number,
					"time in progress": timeInProgress,
					"time in review": timeInReview,
					"time in qa queue": timeInQAQueue,
					"time in qa tests": timeInQATests,
					"time in merge queue": timeInMergeQueue,
				}
			);
		}
		storeValue("issueBottleNecks",issueBottleNecks);
		return issueBottleNecks;
	}
}