var request = require('request');
var cheerio = require('cheerio');

module.exports = InventoryHistory;

function InventoryHistory() {
	this._jar = request.jar();
	this._request = request.defaults({"jar": this._jar});
}

InventoryHistory.prototype.setCookies = function(cookies) {
	var self = this;
	cookies.forEach(function(cookie) {
		self.setCookie(cookie);
	});
};

InventoryHistory.prototype.setCookie = function(cookie) {
	this._jar.setCookieSync(request.cookie(cookie), 'http://steamcommunity.com');
};

InventoryHistory.prototype.getHistory = function(options, callback) {
	if(typeof options === 'function') {
		callback = options;
		options = {};
	}
	
	options.page = options.page || 1;
	
	this._request("http://steamcommunity.com/my/inventoryhistory?l=english&p=" + options.page, function(err, response, body) {
		if(err) {
			callback(err);
			return;
		}
		
		var output = {};
		
		var $ = cheerio.load(body);
		var match = $('.inventory_history_pagingrow').html().match(/(\d+) - (\d+) of (\d+) History Items/);
		
		output.first = parseInt(match[1]);
		output.last = parseInt(match[2]);
		output.totalTrades = parseInt(match[3]);
		
		output.trades = [];
		var trades = $('.tradehistoryrow');
		for(var i = 0; i < trades.length; i++) {
			var item = $(trades[i]);
			var trade = {};
			
			trade.date = item.find('.tradehistory_date').html();
			trade.time = item.find('.tradehistory_timestamp').html();
			trade.partnerName = item.find('.tradehistory_event_description a').html();
			output.trades.push(trade);
		}
		
		callback(null, output);
	});
};