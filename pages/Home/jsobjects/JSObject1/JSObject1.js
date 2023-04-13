export default {
	myVar1: [],
	myVar2: {},
	myFun1 () {
		const data = [
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
  ];
		// Calculate the mean of the inProgressTime field
		const inProgressMean = data.reduce((acc, curr) => acc + (curr.inProgressTime || 0), 0) / data.length;

		// Calculate the mean of the codeReviewTime field
		const codeReviewMean = data.reduce((acc, curr) => acc + curr.codeReviewTime, 0) / data.length;

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
	},
	async myFun2 () {
		//	use async-await or promises
		//	await storeValue('varName', 'hello world')
	}
}