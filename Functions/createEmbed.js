module.exports = async function createEmbed(message, embed) {
return console.log(embed);
  data = message.args
  let foo = data.split('\n').reduce(function(obj, str, index) {
    let strParts = str.split('=');
    if (strParts[0] && strParts[1]) {
      obj[strParts[0].replace(/\s+/g, '')] = strParts[1].trim();
    }
    return obj;
  }, {});

console.log(foo);

  return;
  var embed = {
	  color: color,
	  title: title,
	  url: url,
	  author: {
		  name: authorName,
		  icon_url: authorIconURL,
		  url: authorURL
	  },
	  description: description,
	  thumbnail: { url: thumbnailURL },
	  fields: [ fields ],
	  image: { url: imageURL },
	  timestamp: new Date(),
	  footer: {
		  text: footerText,
		  icon_url: footerIconURL
	  }
  };
  message.channel.send()
  message.channel.send({embeds: [embed]});
}