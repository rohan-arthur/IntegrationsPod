export default {
	myVar1: [],
	myVar2: {},
	/*
		1. Get task breakdown 
    	a. taskBreakdown: [{estimateSize, numberOfTasks}]
		2. Get all cycles times for a given estimate from historical data. This is stored in JS object `CycleTimeUtils` function getStats as `globalCycleTimes`
    	a. cycleTimes: [{estimateSize, duration}]
		3. Remove outliers from cycle times, since they represent grossly wrong estimation or some other freak occurrance.
		4. Next, do this 100000 times:
    	a. For each given estimateSize
    	b. Get random durations n times, randomDuration and add it to array randomDurations[]
    	c. Get the total of elements in randomDurations, push it to randomTotals[int]
    	d. For the 10000 randomTotals, get the following percentiles
        i. 10
        ii. 25
        iii. 50
        iv. 75
        v. 85
        vi. 90
        vii. 95
		5. Add up for each estimate size, the following percentiles:
        a. 10
        b. 25
        c. 50
        d. 75
        e. 85
        f. 90
        g. 95
		6. This is the output
	*/
	monteCarloSimulation: () => {
		const estimations = [0.5,1,2,3,5,8];
		const taskBreakdown = [
			{ estimate: 0.5, number: parseInt(XSInput.inputText) },
			{ estimate: 1, number: parseInt(SInput.inputText) },
			{ estimate: 2, number: parseInt(MInput.inputText) },
			{ estimate: 3, number: parseInt(LInput.inputText) },
			{ estimate: 5, number: parseInt(XLInput.inputText) },
			{ estimate: 8, number: parseInt(XXLInput.inputText) },
		];
		const cycleTimes = appsmith.store.globalCycleTimes;
		const numSimulations = 100000;
		var simulationOutput = [];

		//for each estimation
		for(var i=0;i<estimations.length;i++){
			const cycleTimesForEstimate = cycleTimes.find(obj => obj.estimate === estimations[i]).durations;
			const normalizedCycleTimes = this.removeOutliers(cycleTimesForEstimate);
			const numberOfTasks = taskBreakdown.find((task) => task.estimate === estimations[i]).number;
			var randomTotals = [];
			//for each simulation, so do this 100000 times
			for(var j=1;j<=numSimulations;j++){
				var randomDuration = this.doSimulation(normalizedCycleTimes,numberOfTasks);
				randomTotals.push(randomDuration);
			}
			simulationOutput.push({
				"estimate":estimations[i],
				"numberOfTasks":numberOfTasks,
				"10th percentile":this.getQuantile(randomTotals,0.1),
				"25th percentile":this.getQuantile(randomTotals,0.25),
				"50th percentile":this.getQuantile(randomTotals,0.50),
				"75th percentile":this.getQuantile(randomTotals,0.75),
				"85th percentile":this.getQuantile(randomTotals,0.85),
				"90th percentile":this.getQuantile(randomTotals,0.90),
				"95th percentile":this.getQuantile(randomTotals,0.95)
			}
													 );
		}
		
		var likelyProjectSchedules = this.addUpQuantiles(simulationOutput);
		storeValue('monteCarloSchedule',likelyProjectSchedules)
		return likelyProjectSchedules;
	},
	doSimulation: (cycleTimes,numberOfTasks) =>{
		var randomDurations = [];
		var randomTotalDuration = 0;
		for(var i=0;i<numberOfTasks;i++){
			var randomIndex = Math.floor(Math.random() * cycleTimes.length);
			var randomDuration = cycleTimes[randomIndex];
			
			randomTotalDuration = randomTotalDuration + randomDuration;
			randomDurations.push(randomDuration);
		}
		return randomTotalDuration;
	},
	
	
	getQuantile: (arr, q) => {
		arr.sort((a, b) => a - b); 
		const pos = (arr.length - 1) * q;
		const base = Math.floor(pos);
		const rest = pos - base;
		if (arr[base + 1] !== undefined) {
			return arr[base] + rest * (arr[base + 1] - arr[base]);
		} else {
			return arr[base];
		}
	},
	
	
	removeOutliers: (arr) => {
		var lowerArr = [];
		var higherArr = [];
		var M1 = this.getMedian(arr);

		for(var i=0;i<arr.length;i++){
			if(arr[i]<=M1)
				lowerArr.push(arr[i])
			else
				higherArr.push(arr[i]);
		}
		const M2 = this.getMedian(lowerArr);
		const M3 = this.getMedian(higherArr);
		const IQR = M3-M1;
		const lowerTolerance = M1-(1.5*IQR);
		const higherTolerance = M3+(1.5*IQR);

		var workingArr = arr;

		var filteredValues = workingArr.filter(function(x) {
			return (x <= higherTolerance) && (x >= lowerTolerance);
		});
		return filteredValues;
	},

	
	
	getMedian: (arr) => {
		const sortedNumbers = arr.slice().sort((a, b) => a - b);
		const middleIndex = Math.floor(sortedNumbers.length / 2);
		const median = sortedNumbers.length % 2 === 0 ? (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2 : sortedNumbers[middleIndex];
		return median
	},
	
	
	
	addUpQuantiles: (arr) => {	
		let totalTasks = 0;
		let tenthQuantile = 0;
		let twentyfifthQuantile = 0;
		let fiftiethQuantile = 0;
		let seventyfifthQuantile = 0;
		let eightyfifthQuantile = 0;
		let ninetiethQuantile = 0;
		let ninetyfifthQuantile = 0;

		for(var i=0;i<arr.length;i++){
			totalTasks = totalTasks + arr[i]["numberOfTasks"];
			tenthQuantile = tenthQuantile + arr[i]["10th percentile"];
			twentyfifthQuantile = twentyfifthQuantile + arr[i]["25th percentile"];
			fiftiethQuantile = fiftiethQuantile + arr[i]["50th percentile"];
			seventyfifthQuantile = seventyfifthQuantile + arr[i]["75th percentile"];
			eightyfifthQuantile = eightyfifthQuantile + arr[i]["85th percentile"];
			ninetiethQuantile = ninetiethQuantile + arr[i]["90th percentile"];
			ninetyfifthQuantile = ninetyfifthQuantile + arr[i]["95th percentile"];
		}
		return({
			"totalTasks":totalTasks,
			"tenthQuantile":tenthQuantile,
			"twentyfifthQuantile":twentyfifthQuantile,
			"fiftiethQuantile":fiftiethQuantile,
			"seventyfifthQuantile":seventyfifthQuantile,
			"eightyfifthQuantile":eightyfifthQuantile,
			"ninetiethQuantile":ninetiethQuantile,
			"ninetyfifthQuantile":ninetyfifthQuantile,
		});
	}
}