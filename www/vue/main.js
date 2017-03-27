var events = [
{ id: 0, title: 'happening!', displayTime: '0:22 FM' },
{ id: 1, title: 'gappening!', displayTime: '7:22 FM' },
{ id: 2, title: 'rappening!', displayTime: '0:22 FM' },                      
{ id: 3, title: 'sappening!', displayTime: '7:22 FM' }
];
var CalendarView = {
	template: '#calendar-view',
	data: function() { return {
		dates: [
			{ displayDate: 'blursday, Smarch 32nd',
				events: [ 
					events[0],
					events[1]	
				]
			},
			{ displayDate: 'cryday, Smarch 33rd',
                                events: [
					events[2],
					events[3]
                                ]
                        }
		]
	}; }
};
var AddEvent = {
	template: '#add-event',
	data: function() { return {
		title: 'bleargh',
		description: 'fnoo'
	}; }
};
var SingleEvent = {
	template: '#single-event',
	props: ['id'],
	data: function() {
		return events[this.id];
	}
}
var router = new VueRouter({
	mode: 'history',
	base: '/shiftcal/www/vue',
	routes: [
		{ path: '/calendar-view', component: CalendarView },
		{ path: '/add-event', component: AddEvent },
		{ path: '/event/:id', component: SingleEvent, props: true },
	]
});
var shiftcal = new Vue({
	router
}).$mount('#shiftcal');
