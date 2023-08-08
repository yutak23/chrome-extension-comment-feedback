// https://developer.chrome.com/docs/extensions/mv3/messaging/#simple
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
	if (request.input) {
		const apiKey = '<your apikey here>';

		fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
			body: JSON.stringify({
				model: 'gpt-3.5-turbo-0613',
				messages: [
					{
						role: 'system',
						content: `与えられたコメントの語気を分析して下さい。
5段階評価で評価し、語気を柔らかくし人間が心地よく感じる改善後のコメント例と、コメントの語気を柔らかくするためのアドバイスを提示してください。
ただし、JSON形式で出力してください。
JSONのキーは、以下の通りにしてください。
・input_comment: 入力されたコメント
・improved_comment: 語気を柔らかくした改善後のコメント
・rating: 5段階評価の値
・advice: コメントの語気を柔らかくするためのアドバイス
`
					},
					{
						role: 'system',
						content: `コメント: ${request.input}`
					}
				]
			})
		})
			.then((response) => {
				if (!response.ok)
					sendResponse({
						output: null,
						error: `Failed to fetch. Status code: ${response.status}`
					});
				return response.json();
			})
			.then((data) => {
				console.log(data);
				if (data && data.choices && data.choices.length > 0)
					sendResponse({ output: data.choices[0].message.content, error: null });
			})
			.catch((e) => {
				console.log(e);
				sendResponse({ output: null, error: e.message });
			});
	}
	return true;
});
