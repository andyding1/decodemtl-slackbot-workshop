# DecodeMTL Slack Bot workshop

In this workshop we will be creating a Slack bot for DecodeMTL.

This Slack bot will idle in any channel it gets invited to until it sees a message that starts with "documentation for ...".

Once such a message is seen, the bot will parse the documentation request from the message and search the [MDN API](https://developer.mozilla.org/en-US/docs/MDN/Contribute/Tools/Search#JSON_response_body_format) for that documentation.

The bot will then wait until the search results are received, parse them out and display the first few results in the channel where it was requested.

To accomplish this, we will be using a few NPM libraries:

* [`slackbots`](https://www.npmjs.com/package/slackbots)
* [`request`](https://www.npmjs.com/package/request)


## Step 1: Making a search on MDN
MDN has a JSON API that returns pages of search results in JSON format instead of HTML. This is super useful for a programmatic search because it's much easier for our code to make sense of JSON vs. say HTML.

In JavaScript, we can simply call `JSON.parse` on any valid JSON string and get back the value corresponding to the string representation.

First, let's do a regular search on MDN for the array `indexOf` method:

https://developer.mozilla.org/en-US/search?q=indexOf

If you follow the previous link, it will take you to a search results page with the first 10 results.

To get the results programmatically, MDN allows us to simply add a `.json` extension to the `search` in the URL. If we do that we get what looks like a completely different result:

https://developer.mozilla.org/en-US/search.json?q=indexOf

Take a moment to compare both outputs. Even though they look extremely different, they contain the same information but in different formats. If you are having trouble viewing the JSON in your browser, there is a JSONView plugin for [Chrome](https://chrome.google.com/webstore/detail/jsonview/chklaanhfefbnpoihckbnefhakgolnmc?hl=en) and [Firefox](https://addons.mozilla.org/en-us/firefox/addon/jsonview/). Install the plugin and refresh the JSON results.

Now that we know how to retrieve MDN search results in a format that is easily read by our JavaScript code, let's use the NPM `request` library to make the same request in our code.

Create a file called `mdn.js`. In it, create a function called `doMDNSearch`. Your function should take a keyword and a callback. It should use the `request` library to do the appropriate request to MDN's JSON API, parse the result and send it to the callback function.

**NOTE 1**: NodeJS callbacks will by convention take an eventual error as the first argument, and the eventual response as the second argument.

**NOTE 2**: The `JSON.parse` function will throw an error if it is given an invalid JSON string. This could happen for many reasons. For example, if we forget the `.json` in the request URL, the returned response will be in HTML format and `JSON.parse` will definitely fail. To avoid this we can put the `JSON.parse` bit in a `try/catch` block. If the parsing fails, we can call our callback with a `new Error(...)`.

Once your `doMDNSearch` function is implemented and tested, you can export it from `mdn.js` using `module.exports`. Then, move on to step 2.

## Step 2: Creating a Slack bot
Our Slack bot will be using [Slack's Real Time Messaging API](https://api.slack.com/rtm). Thankfully, someone has already made our job much easier by creating and sharing a `slackbots` package on NPM. `slackbots` takes care of a lot of the underlying code that is necessary to connect to Slack's servers, and lets us write only the interesting bits.

**NOTE 1**: To move forward with this project, your bot code will need a token. Ask your instructor to send you a token.

**NOTE 2**: While testing your bot, please use a test channel to make sure we are not polluting the main chat.

Take a look at the [slackbots usage example](https://github.com/mishk0/slack-bot-api) on the GitHub page for the project.

Based on the usage examples and your own knowledge, create a simple Slack bot in `bot.js` that will simply print every chat message to the JavaScript console where you are testing the bot code, along with the channel where the message happened.

To do this, you'll need to use the bot's `.on('message')` event. When a `message` event happens, the Slack API will send an event and your event handler will be called with one argument. Some examples of `message` events are:

```json
{ "type": "hello" }
```

```json
{
  "text": "testing 123",
  "username": "DecodeMTL Butler",
  "type": "message",
  "subtype": "bot_message",
  "channel": "G0FKFCF3P",
  "ts": "1454512457.000011"
}
```

```json
{
  "type": "presence_change",
  "user": "U0KEXQGTU",
  "presence": "active" }
```

We can see that not all `message` events are actual chat messages. Only those where the `type` is `message`. Moreover, for the actual chat messages, we can see that the channel -- `"G0FKFCF3P"` in this case -- does not correspond to the channel name but to its unique ID.

To do this step properly, we'll need to filter out the `message` events to only output real messages. We will also need to use `slackbots`' `getChannels()` function to retrieve all the channels.

One thing that could help is to create a *helper function* called `getChannelNameById` that would take an ID and retrieve the channel name.

## Step 3: Putting it all together
Now that we are able to filter out chat messages and print them, let's put this together with Step 1 in order to create the finished bot.

To do this, we'll need to check each incoming message to see if it starts with "documentation for ". We can either use the `String.prototype.indexOf` function, or the newer ES6 `String.prototype.startsWith` function, up to you.

Once we detect a message starting with "documentation for ", we will take whatever comes after these two words and pass them to the `doMDNSearch` function we created in Step 1. To do this, we will need to `require` the module we created from `bot.js`.

When we receive the answers from the MDN search, we should use `slackbots`' `postMessageToChannel` to output the first few search results as well as their URLs. Here, we can take advantage of [Slack's message formatting](https://get.slack.help/hc/en-us/articles/202288908-Formatting-your-messages) to make our output even better. We will also need to make use of that `getChannelNameById` function we created in Step 2 to figure out where we need to reply with the search results.

## Step 4: Optional enhancements
If you've gotten this far, you must be starting to get quite comfortable with the `slackbots` package. Let's take our bot a step further.

Here are a few examples of things you could do:

### Make the bot smarter
MDN's search API allows us to pass a topic filter in addition to our search query. For example, if we want to only search the JavaScript topics, we can add `&topic=js` to the query string.

Let's try to make the bot smarter. If the Slack user enters "documentation for something" then we should do a regular search.

If they specify "css documentation for something", then we should only search for that "something" in the css topic.

Let's limit our use-cases to HTML, CSS and JavaScript. See if you can make this work.

This may be a good opportunity to start learning about [regular expressions](http://codular.com/regex). While `indexOf` and `startsWith` can take us a long way, sometimes we want to express string conditions that are a bit more complex.

For example here we could be testing for the following regular expression:

```javascript
/(html |css |javascript )?documentation for (.+)/
```

or even

```javascript
/((html|css|javascript) )?documentation for (.+)/
```

### Make the bot run "forever"
Running the bot by issuing a `node bot.js` on the console is fine for testing. But if you hit `Ctrl+C` or simply close your terminal window, the bot will be disconnected.

One way to prevent this is to run our Node application through a process manager. A popular one is [PM2](http://pm2.keymetrics.io/docs/usage/quick-start/). Once it is installed globally using NPM, you can issue a `pm2 start bot.js` and your bot will run in the background. It still won't be immune to your computer restarting or losing its internet connection.

### Deploy the bot on [Heroku](https://www.heroku.com/)
[Heroku](https://www.heroku.com/) gives you a server environment where you can run, among other things, your NodeJS applications.

Deploying an application to Heroku can be as simple as issuing a `git push` from your command line, but it does take a bit of time to setup.

See if you can follow the [NodeJS getting started doc](https://devcenter.heroku.com/articles/getting-started-with-nodejs#introduction) on Heroku's site.

A few things you'll need to make sure of:

* Your application has a `package.json` initialized by `npm init`
* All your dependencies have been installed using `npm install --save`
* The `node_modules` directory is ignored in your `.gitignore` file.

### Add some caching
Caching is a complex subject. The premise sounds simple: take the result of a long and/or costly operation, keep it in memory and if that same operation is requested again use the data in memory instead.

What if the data changes between the first request and the one that uses the cache? Let's not go there, it's way out of the scope of this workshop.

However, we can still take a stab at a simple and naïve caching. In our `mdn.js` module, we could start with an empty `cache` object. If a new keyword is requested, we first check if the cache object has a property that corresponds to this keyword. If it does, we can return the value of that property. If it does not, we do the search, put the data in the cache and return it to our caller's callback function.

By doing this, it becomes clear that **if MDN updates its search results and we do not invalidate our cache object, then we will be serving stale results to our users.**

### The sky is (not) the limit
This step 4 is open-ended on purpose. If you can think of something else, add it! Don't hesitate to open a Pull Request to add more optional enhancements to the bot!
