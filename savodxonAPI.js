/* Ushbu hujjat sizga savodxon.uz saytidagi imlo tekshirish dasturiga API orqali so'rov yuborish va javob olish usullarini ko'rsatish uchun misol tariqasida yaratildi.

2018 (c) Javlon Juraev */

//Birinchi navbatda, asosiy birliklarni belgilab olamiz

//Matn tekshirish uchun so'rov yuboriladigan manzil
spellURL = 'https://savodxon.uz/api/check';

//Xato so'zga to'g'ri variantlar olish uchun so'rov yuboriladigan manzil
suggestionsURL = 'https://savodxon.uz/api/suggestions';

//Sizning domeningiz uchun maxsus yaratilgan API kaliti. Agar hali kalit yaratmagan bo'lsangiz, http://savodxon.uz/api.html sahifasida kalit yaratishingiz mumkin. Bu birlikni bo'sh qoldirish mumkin emas. Shuningdek, bir domenning kalitini boshqa domenda ishlatish ham mumkin emas.
apiKey = 'misoluchunkeltirilgankalit';

//Tahrir oynasidan olingan matnni so'zlarga ajratib, serverga yuborib, tekshirilgan natijani qabul qiladigan funksiya
checkWords = function(inputHtml) {
	//Kiritilgan HTML ichidagi matnlarni ajratib olamiz
	var rawText = collectTexts(inputHtml);
	//Matndagi ortiqcha yuklama va elementlarni o'chiramiz
	rawText = remModifiers(rawText);
	//Matnni so'zlarga ajratamiz
	var words = rawText.split(/[^a-zA-Zʻʼ\'\-]+/g);
	//So'zlar massividan keraksiz a'zolarni chiqarib tashlaymiz
	words = words.filter(function(x) {
		return x !== undefined && x != null && x != '';
	});
	//Massivni serverga uzatish uchun tayyorlaymiz
	var text = JSON.stringify(words);
	//Serverga uzatish parametrini tayyorlaymiz. "text" birligi nomi shundayligicha qolishi lozim, chunki server unga kelgan so'rovdan aynan shu nomdagi birlikni izlaydi va topa olmasa, xato qaytaradi.
	var data = "apikey="+apiKey+"&text="+text;
	//Serverga so'rov yuboramiz
	$.ajax({
		type: "POST",
		url: spellURL,
		data: data,
		cache: false,
		success: function(response){
			//So'rovga javob olinganini tekshiramiz
			if (response.success) {
				//Olingan javobda xato so'zlar ro'yxati mavjudligini tekshiramiz
				if (response.errors) {
					//Kiritilgan HTML da xato so'zlarni ajratib (ya'ni <error></error> tegga o'rab) qaytarish
					var outputHtml = highLight(inputHtml, response.words);
					return outputHtml;	
				} else {						
					//Funskiya natijasi sifatida 0 qaytariladi - ya'ni xato so'zlar topilmadi
					return 0;
				}
			} else {					
				//Funskiya natijasi sifatida 1 qaytariladi - ya'ni xatolarni topishda serverda nosozlik yuz berdi
				return 1;
			}
		},
		error: function(response){
			//Funskiya natijasi sifatida 2 qaytariladi - ya'ni AJAX so'rovda xato yuz berdi
			console.log(response);
			return 2;
		}
	});
};

//Xato deb topilgan alohida so'zga to'g'ri variantlarni serverdan so'rab oladigan funksiya
getSuggestions = function(word) {
	//So'zni JSON formatga o'tkazib olamiz
	var text = JSON.stringify(word);
	//Serverga uzatish parametrini tayyorlaymiz. "text" birligi nomi shundayligicha qolishi lozim, chunki server unga kelgan so'rovdan aynan shu nomdagi birlikni izlaydi va topa olmasa, xato qaytaradi.
	var data = "apikey="+apiKey+"&text="+text;
	//Serverga so'rov yuboramiz
	$.ajax({
		type: "POST",
		url: suggestionsURL,
		data: data,
		cache: false,
		success: function(response){
			console.log(response);
			//So'rovga javob olinganini tekshiramiz
			if (response.success) {
				//Olingan javobda xato so'zga to'g'ri variantlar borligini tekshiramiz
				if (response.isSuggested) {
					//Taklif qilingan to'g'ri variantlar massivini qaytaramiz
					var suggestions = response.suggestions;
					return suggestions;	
				} else {						
					//Funskiya natijasi sifatida 0 qaytariladi - ya'ni xato so'zga to'g'ri variantlar topilmadi
					return 0;
				}
			} else {					
				//Funskiya natijasi sifatida 1 qaytariladi - ya'ni variantlarni topishda serverda nosozlik yuz berdi
				return 1;
			}
		},
		error: function(response){
			//Funskiya natijasi sifatida 2 qaytariladi - ya'ni AJAX so'rovda xato yuz berdi
			console.log(response);
			return 2;
		}
	});
};

//O' G', tutuq belgisi va qo'shtirnoqlarni avtomatik to'g'rilaydigan funksiya
autoCorrect = function(text){
	var text = text.replace(/ʻ|‘|’|'|`/g,"ʼ");
	var text = text.replace(/([GOgo])ʼ/g,"$1ʻ");
	var text = text.replace(/«|"([^»])/g, '“$1');
	var text = text.replace(/([^"])"|»/g, '$1”');
	return text;
};

//ba'zi yuklamalar, email va veb manzillarni tozalab tashlovchi funksiya
remModifiers = function(text){
	var text = text.replace(/\b[A-Z]+[a-z]+[A-Z]+[a-z]{0,}\b|\b[A-Z]{2,}[a-z]{0,}\b/g,"");
	var text = text.replace(/([aouei]g|[aouei]gʻ)\-(a|u)\b/g,"$1г$2");
	var text = text.replace(/\-(a|ku|yu|u|da|ya|chi)\b/g,"");
	var text = text.replace(/\-/g," ");
	var text = text.replace(/г/g,"-");
	var text = text.replace(/\b(Sh|Ch|Yu|Yo|Ya|Ye)\./g,"");
	var text = text.replace(/([^a-zA-Z\-ʻʼ])u\b/g,"$1");
	var text = text.replace(/(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/ig, "");
	var text = text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/ig, "");
	return text;
};

//Berilgan HTML ichidan matnlarni ajratib olish funskiyasi
collectTexts = function(inputHtml) {
	var inputHtml = inputHtml.replace(/<error[^>]*>([^<]+)<\/error>/g, "$1");
	var texts = '';
	var tempDiv = $('<div />', {'id':'yashirin_oyna','stye':'display:none'});
	tempDiv.html(inputHtml);
	var allNodes = tempDiv.getElementsByTagName("*");
	for (var key in allNodes) {
		var el = allNodes[key];			
		if (el.nodeName !== 'SCRIPT' && el.nodeName !== 'STYLE' && el.nodeName !== 'PRE'){
			var children = el.childNodes;
			if (children !== undefined){
				x = children.length; 
				for (i=0; i<x; i++){
					if (children[i].nodeType == 3 && children[i].nodeValue !== "\n"){
						text  = children[i].nodeValue;
						children[i].nodeValue = autoCorrect(text);
						if (el.nodeName === 'SPAN'){
							texts += autoCorrect(text);
						} else {
							texts += " " +autoCorrect(text);
						}
					}
				}
			}
		}
	}
	tempDiv.remove();
	return texts;
};

//Aniqlangan xatolarni tahrir oynasidagi matnda ajratib ko'rsatuvchi funksiya
highLight = function(inputHtml, words){
	var tempDiv = $('<div />', {'id':'yashirin_oyna','stye':'display:none'});
	tempDiv.html(inputHtml);
    if (words.length > 0) {
		textParts = [];
		var allNodes = tempDiv.getElementsByTagName("*");
		for (var key in allNodes) {
			var el = allNodes[key];
			if (el.nodeName !== 'SCRIPT' && el.nodeName !== 'STYLE' && el.nodeName !== 'PRE'){
				var children = el.childNodes;
				if (children !== undefined){
					x = children.length;
					for (i=0; i<x; i++){
						if (children[i].nodeType == 3){
							textParts.push(children[i]);
						}
					}
				}
			}
		}
		textParts.forEach(function(part) {
			text  = part.nodeValue;
			words.forEach(function(word){
				var regx = /^(ku|yu|da|ya|chi)$/;
				if (!regx.test(word)) {
					var wrapped = "\(^\|[^a-zA-Zʻʼ\']\)\("+word+"\)\([^a-zA-Zʻʼ\']\|$\)";
						var pat = new RegExp(wrapped, "g");
						text = text.replace(pat, "$1<error>$2</error>$3");
				}
			});
			$(part).replaceWith(text);
		});
	}
	var outputHtml = tempDiv.html();
	tempDiv.remove();
	return outputHtml;
}
