export default {
	myVar1: [],
	myVar2: {},
	myFun1 () {

	},
	getISOWeekNumber(date) {
		const d = new Date(date);
		d.setHours(0, 0, 0);
		d.setDate(d.getDate() + 4 - (d.getDay() || 7));
		const yearStart = new Date(d.getFullYear(), 0, 1);
		return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
	},

	async getPRsForMembers() {
		const members = ["rishabhrathod01", "sumitsum", "NilanshBansal", "AmanAgarwal041", "sneha122", "rohan-arthur"];
		let data = [];
		for(var i=0; i<members.length; i++){
			var memberPRs = await GetPRsforAuthor.run({query:"repo:appsmithorg/appsmith is:pr is:closed sort:updated-desc author:"+members[i]});
			var obj = {};
			data.push({ name: members[i], PRs: memberPRs })
		}
		const result = {};
		const currentDate = new Date();
		data.forEach(authorData => {
			const authorName = authorData.name;

			authorData.PRs.data.search.edges.forEach(pr => {
				const closedDate = new Date(pr.node.closedAt);

				// Check if the closed date is on or after January 1, 2024, and before or equal to the current date
				if (closedDate >= new Date("2024-01-01T00:00:00Z") && closedDate <= currentDate) {
					const weekKey = `${this.getISOWeekNumber(closedDate)}/${closedDate.getUTCFullYear()}`;

					if (!result[weekKey]) {
						result[weekKey] = {};
					}

					if (!result[weekKey][authorName]) {
						result[weekKey][authorName] = 0;
					}

					result[weekKey][authorName]++;
				}
			});
		});

		// Convert result object to the desired array format
		const resultArray = Object.entries(result).map(([weekKey, authorData]) => {
			return { week: weekKey, ...authorData };
		});

		// Sort the result array by week in ascending order
		//resultArray.sort((a, b) => new Date(a.week) - new Date(b.week));
		resultArray.sort((a, b) => parseInt(a.week.split('/')[0]) - parseInt(b.week.split('/')[0]));

		if (Array.isArray(resultArray) && resultArray.length > 0) {
			console.log("from home function is array");
		}else{
			console.log("from home function is not array");
		}

		return resultArray;
	},
	async formatTotalsChartData(){
		const inputData = await this.getPRsForMembers();
		// Transform data for the graph
		const totalsChartData = {
			dataset: {
				source: [
					["Week", "Total Closed PRs"],
					...inputData.map(entry => [entry.week, ((entry.rishabhrathod01 || 0) + (entry.sumitsum || 0) + (entry.NilanshBansal || 0) + (entry.AmanAgarwal041 || 0) + (entry.sneha122 || 0))])							
				]
			},
			tooltip: {
				trigger: "axis",
				axisPointer: {
					type: "shadow"
				}
			},
			title: {
				text: "Total Closed PRs per Week",
				left: "center",
				textStyle: {
					width: 200,
					overflow: "truncate"
				}
			},
			legend: {
				top: 40,
				type: "scroll"
			},
			grid: {
				left: 15,
				right: 15,
				bottom: 30,
				top: 100,
				containLabel: true
			},
			xAxis: [
				{
					type: "category",
					name: 'weeks',
					nameLocation: 'middle',
					nameGap: 25,
					nameTextStyle: {
						padding: 0,
						fontWeight: 'bold',
						fontSize: 15
					}
				}
			],
			yAxis: [
				{
					type: "value",
					name: 'PRs',
					nameLocation: 'middle',
					nameGap: 25,
					nameTextStyle: {
						padding: 0,
						fontWeight: 'bold',
						fontSize: 15
					}
				}
			],
			series: [
				{
					type: "bar",
					name: "Total Closed PRs",
					data: inputData.map(entry => (entry.rishabhrathod01 || 0) + (entry.sumitsum || 0) + (entry.NilanshBansal || 0) + (entry.AmanAgarwal041 || 0) + (entry.sneha122 || 0))
				}
			]
		};
		storeValue('totalsChartData', totalsChartData);
		return totalsChartData;
	}
}