// var template = document.querySelector(".template");
// var testData = [{
//     title: "Leroy found dead",
//     desc: "Mr Jenkins collapsed after what can only be described as an aggressive attempt at self destruction. It would appear that he was successful.",
//     author: "Batman"
// }, {
//     title: "I have no fingers",
//     desc: "So how am I typing this?",
//     author: "Fingerless Jack"
// }, {
//     title: "Where are my eyes?",
//     desc: "I cannot see.",
//     author: "Jacob"
// }, {
//     title: "184753 Chicken recipies",
//     desc: "EVERYTHING DOES TASTE LIKE CHICKEN.",
//     author: "Jacob"
// }, {
//     title: "XViews is the best thing since sliced bread",
//     desc: "And I hate sliced bread.",
//     author: "Mr Magoo"
// }];

// var averageRender = 0,
//     averageBuild = 0,
//     highestBuild = 0,
//     highestRender = 0,
//     fullTime = 0;

// for (var i = 0; i < 100; i++) {

//     var el = template.cloneNode(true);

//     el.classList.add("test-" + i);

//     document.documentElement.appendChild(el);

//     var t0 = performance.now();
//     var view = new View(el);
//     var t2 = performance.now();

//     fullTime += t2 - t0;

//     averageBuild += t2 - t0;

//     if (t2 - t0 > highestBuild) highestBuild = t2 - t0;


//     console.log("Building view took", t2 - t0, "milliseconds");

//     t0 = performance.now();
//     view.render({
//         results: testData
//     });
//     t2 = performance.now();

//     fullTime += t2 - t0;


//     averageRender += t2 - t0;
//     if (t2 - t0 > highestRender) highestRender = t2 - t0;



//     console.log("Rendering view took", t2 - t0, "milliseconds");

//     view.watch("search", function () {

//         var filter = this.data.search.toLowerCase(),
//             res = testData.filter(function (item) {

//                 for (var key in item) {
//                     if (item[key].toLowerCase().indexOf(filter) > -1) return true;
//                 }

//                 return false;
//             });

//         this.set("results", res);
//     });
// }
// console.warn("Finished initializing, here's the stats");
// console.table({
//     averageBuild: averageBuild / 100,
//     averageRender: averageRender / 100,
//     highestBuild: highestBuild,
//     highestRender: highestRender,
//     fullTime: fullTime
// });


var testData = [{
	title: "Leroy found dead",
	desc: "Mr Jenkins collapsed after what can only be described as an aggressive attempt at self destruction. It would appear that he was successful.",
	author: "Batman"
}, {
	title: "I have no fingers",
	desc: "So how am I typing this?",
	author: "Fingerless Jack"
}, {
	title: "Where are my eyes?",
	desc: "I cannot see.",
	author: "Jacob"
}, {
	title: "184753 Chicken recipies",
	desc: "EVERYTHING DOES TASTE LIKE CHICKEN.",
	author: "Jacob"
}, {
	title: "XViews is the best thing since sliced bread",
	desc: "And I hate sliced bread.",
	author: "Mr Magoo"
}];

var view = new View(".template");

console.log(view)

view.render({
	results: testData
});

view.watch("search", function () {


	var filter = view.data.search.toLowerCase(),
		res = testData.filter(function (item) {

			for (var key in item) {
				if (item[key].toLowerCase().indexOf(filter) > -1) return true;
			}

			return false;
		});

	view.set("results", res);
});