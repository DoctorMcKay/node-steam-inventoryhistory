# Steam Inventory History

This small module allows you to easily retrieve the trade history for your Steam account from Node. It works by parsing the [inventory history page](http://steamcommunity.com/my/inventoryhistory) so there may be problems with different localizations.

This might be useful to check if a "failed" [trade offer](https://github.com/Alex7Kom/node-steam-tradeoffers) actually went through.

# Installation

Just install it from npm:

    $ npm install steam-inventoryhistory

# Usage

This module exports a class, so you'll need to instantiate an instance of it:

```js
var InventoryHistory = require('steam-inventoryhistory');
var history = new InventoryHistory();
```

Then, set it up with your cookies. You can get these from [node-steam](https://github.com/seishun/node-steam)'s `webLogOn` method.

```js
// Example using node-steam
steam.on('webSessionID', function(sessionID) {
	steam.webLogOn(function(cookies) {
		history.setCookies(cookies);
		// You can also call history.setCookie for each cookie in the array
	});
});
```

Finally, you can call the `getHistory` method to get your inventory history.

# Methods

## setCookies(cookies)

Sets up the internal cookie jar with an array of `cookies`. You might get these from [node-steam](https://github.com/seishun/node-steam).

## setCookie(cookie)

Adds a single cookie to the internal cookie jar. The `setCookies` method just calls this method once for each cookie in the array.

## getHistory([options,] callback)

The meat and potatoes. This method actually retrieves the trade history. There's an optional `options` parameter which should be an object containing up to two properties:

- `page` - The page number of inventory history to retrieve, starting at 1. There are 30 items per page. Defaults to 1.
- `resolveVanityURLs` - The inventory history page doesn't give Steam IDs for users who have configured a custom profile URL. If this is specified, then `node-steam-inventoryhistory` will request the XML profile of each unique trader to get their Steam IDs. Defaults to `false`.

The callback will receive two parameters:

- `err` - An error that occurred, or `null` if success
- `history` - An object containing the data on the requested history page:
	- `first` - The index of the first trade on this page, starting from 1, where 1 is the most recent trade we've made. For example, if you request page 3 and there are 30 items per page, this will be 61.
	- `last` - The index of the last trade on this page.
	- `totalTrades` - The total number of trades in your history.
	- `trades` - An array containing the trades on this page:
		- `date` - The date on which this trade took place, in the format of "Sep 30" (in the US). Unfortunately, the year doesn't appear to be available.
		- `time` - The time when this trade took place, in the format of "12:00pm" (in the US).
		- `partnerName` - The current profile name of the person you traded with.
		- `partnerSteamID` - The 64-bit Steam ID of the person you traded with. This will be `null` if they have a custom URL and you didn't specify `resolveVanityURLs`.
		- `partnerVanityURL` - The custom profile URL of the person you traded with, if it exists. `null` if they don't have one.
		- `itemsReceived` - An array of items you received.
		- `itemsGiven` - An array of items you lost.

Note that this method may take quite some time to complete since Steam generally takes a while to generate and send the inventory history page.