export default {
	myVar1: [],
	myVar2: {},
	estimates : [0.5, 1, 2, 3, 5, 8],
	getForecasts: () => {
		//write code here
	},
	velocityBasedForecast: () =>{
		let totalPoints = parseInt(XSInput.inputText) + parseInt(SInput.inputText) + parseInt(MInput.inputText) + parseInt(LInput.inputText) + parseInt(XLInput.inputText) + parseInt(XXLInput.inputText);
		let velocity = parseInt(VelocityInput.inputText);

		return (totalPoints/velocity).toPrecision(3);
	},
	pertForecast: () =>{
		let O = parseFloat(this.velocityBasedForecast());
		console.log("O "+O);
		let M = parseFloat(MidInput.inputText);
		console.log("M "+M);
		let P = parseFloat(UpperInput.inputText);
		console.log("P "+P);
		console.log(((O+(4*M)+P)/6).toPrecision(3));
		return ((O+(4*M)+P)/6).toPrecision(3);
	}
}