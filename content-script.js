// https://projects.lukehaas.me/css-loaders/
const loadingEl = `
<div id="chatgpt-loading" class="d-flex justify-content-start align-items-center my-2">
    <div class="mr-2">ChatGPTで評価中</div>
    <div>
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>
</div>
`;

const cardEl = (options = { rating: 0, improved_comment: '', advice: '' }) => `
			<div id="chatgpt-feedback-alert" class="alert alert-light my-2" role="alert">
				<h6 class="alert-heading">ChatGPTによるコメントの評価結果</h6>
				<p>語気の柔らかさレベル：${options.rating}</p>
				<hr />
				<h6 class="alert-heading">コメントの改善例</h6>
				<p>
					${options.improved_comment}
				</p>
				<hr />
				<h6 class="alert-heading">コメントをする際のアドバイス</h6>
				<p>
					${options.advice}
				</p>
				<div class="d-flex justify-content-end">
                    <button id="close-chatgpt-comment" type="button" class="btn btn-outline-secondary me-2">閉じる</button>
					<button id="adopt-chatgpt-comment" type="button" class="btn btn-outline-secondary">改善後のコメントを採用</button>
				</div>
			</div>
`;

$(function () {
	let registeredOnblurElId = null;
	let evaluating = false;

	$(document).on('input', function (inputEvent) {
		const targetEl = inputEvent.target;

		// blurイベントリスナーがない場合
		if (targetEl.tagName === 'TEXTAREA' && inputEvent.target.id !== registeredOnblurElId) {
			$(targetEl).on('blur', async function (e) {
				if (evaluating) return;

				evaluating = true;
				const input = $(`#${e.target.id}`).val();

				$(`#chatgpt-feedback-alert`).remove();
				$(`#${e.target.id}`).after(loadingEl);

				// https://developer.chrome.com/docs/extensions/mv3/messaging/#simple
				const response = await chrome.runtime.sendMessage({ input });

				$(`#chatgpt-loading`).remove();
				$(`#${e.target.id}`).after(cardEl(JSON.parse(response.output)));

				$('#adopt-chatgpt-comment').on('click', () => {
					$(`#${e.target.id}`).val(JSON.parse(response.output).improved_comment);
					$(`#chatgpt-feedback-alert`).remove();
				});
				$('#close-chatgpt-comment').on('click', () => {
					$(`#chatgpt-feedback-alert`).remove();
				});

				evaluating = false;
			});
			registeredOnblurElId = inputEvent.target.id;
		}
	});
});
