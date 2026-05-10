const EMOJIS = [
  '😀', '😂', '😍', '🥰', '😎', '🤩', '🥳', '😜', '🤪', '😇',
  '🤗', '😏', '🙃', '😋', '😊', '🤭', '😌', '🥺', '😻', '🐱',
  '🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🦋', '🌸', '🌺',
  '🌻', '🌈', '⭐', '🔥', '💫', '✨', '💎', '🎉', '🎊', '🎈',
];

function randomEmojis(n) {
  return Array.from({ length: n }, () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]).join('');
}

function injectEmojis() {
  const accountName = document.querySelector('div.account-name.d-inline-block.text-truncate.align-middle');
  if (!accountName?.textContent?.includes('ThaiExpress')) return;

  const list = document.querySelector('div.list-group.list-group-flush');
  if (!list) return;

  list.querySelectorAll('div.list-group-item.list-group-item-action.list-group-item-chat').forEach(item => {
    const h6 = item.querySelector('h6.mb-0.text-truncate.text-truncate-box');
    if (!h6 || h6.dataset.emojiInjected) return;
    h6.dataset.emojiInjected = '1';
    const leadName = h6.textContent.trim();
    chrome.storage.local.get('service_admin_token', ({ service_admin_token }) => {
      const token = service_admin_token?.token;
      fetch(`http://localhost:19902/csr/leads?name=${leadName}&channel=line`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(r => r.json())
        .then(res => {
          if (res.status == 'success') {

            const lead = res.leads[0]

            console.log(res)

            const contentCol = h6.parentElement.parentElement;
            const manualBadgeRow = item.querySelector('div.badge.badge-outline-info')?.parentElement;

            item.style.position = 'relative';

            const isHighlight = ['TO FOLLOW UP', 'PASS ON'].some(s => lead.journal_status?.includes(s));
            const badgeBottom = manualBadgeRow
              ? (() => { const ir = item.getBoundingClientRect(), mr = manualBadgeRow.getBoundingClientRect(); return ir.bottom - mr.top + 2; })()
              : 6;

            const hasNote = isHighlight && !!lead.journal_note?.trim();
            const NOTE_EXT = 18;
            if (hasNote) {
              item.style.paddingBottom = NOTE_EXT + 'px';
              item.classList.add('csr-padded');
            }

            const badge = document.createElement('span');
            badge.textContent = lead.journal_status;
            badge.className = 'csr-badge';
            const badgeCssBottom = hasNote ? badgeBottom + NOTE_EXT : badgeBottom;
            badge.style.cssText = `position:absolute;bottom:${badgeCssBottom}px;right:8px;padding:2px 6px;border-radius:999px;font-size:10px;font-weight:600;white-space:nowrap;${isHighlight ? 'background:#0d6efd;color:#fff;' : 'background:#e9ecef;color:#6c757d;'}`;
            item.appendChild(badge);

            if (hasNote) {
              const noteEl = document.createElement('span');
              noteEl.textContent = lead.journal_note.trim();
              noteEl.className = 'csr-note';
              noteEl.style.cssText = 'position:absolute;bottom:4px;right:8px;font-size:10px;color:#0d6efd;white-space:nowrap;max-width:160px;overflow:hidden;text-overflow:ellipsis;text-align:right;';
              item.appendChild(noteEl);
            }

            if (lead.journal_create_at) {
              const created = new Date(lead.journal_create_at);
              const today = new Date();
              const isToday = created.getFullYear() === today.getFullYear() &&
                created.getMonth() === today.getMonth() &&
                created.getDate() === today.getDate();
              if (isToday) {
                const timeEl = document.createElement('span');
                timeEl.className = 'csr-time';
                timeEl.textContent = `${created.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - ${lead.admin_name}`;

                let timeColor = '#28a745';
                const datetimeEl = item.querySelector('.datetime.text-right.small.text-muted');
                if (datetimeEl) {
                  const timeText = datetimeEl.textContent.trim();
                  const match = timeText.match(/^(\d{1,2}):(\d{2})$/);
                  if (match) {
                    const chatTime = new Date(today);
                    chatTime.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
                    if (chatTime > created) timeColor = '#888888';
                  }
                }

                if (manualBadgeRow) {
                  timeEl.style.cssText = `font-size:12px;font-weight:500;color:${timeColor};white-space:nowrap;display:block;`;
                  contentCol.insertBefore(timeEl, manualBadgeRow);
                } else {
                  timeEl.style.cssText = `position:absolute;bottom:6px;font-size:12px;font-weight:500;color:${timeColor};white-space:nowrap;`;
                  timeEl.style.left = contentCol.offsetLeft + 'px';
                  item.appendChild(timeEl);
                }
              }
            }
          }

          else {
            const isManual = !!item.querySelector('div.badge.badge-outline-info');
            if (!isManual) {
              item.style.backgroundColor = '#fdfbfb';
              item.classList.add('csr-error-item');
              h6.style.color = '#c0392b';
            }
          }

          /*
          if (res.data.leads.length == 0) {

            return
          }
          if (res.data.leads.length == 1) {
            return
          }*/


        });
    });
  });
}


chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'REFRESH_LINE_BADGES') return;
  document.querySelectorAll('h6.mb-0.text-truncate.text-truncate-box[data-emoji-injected]').forEach(h6 => {
    delete h6.dataset.emojiInjected;
  });
  document.querySelectorAll('.csr-badge, .csr-time, .csr-note').forEach(el => el.remove());
  document.querySelectorAll('.csr-padded').forEach(el => { el.style.paddingBottom = ''; el.classList.remove('csr-padded'); });
  document.querySelectorAll('.csr-error-item').forEach(el => { el.style.backgroundColor = ''; el.classList.remove('csr-error-item'); });
  injectEmojis();
});

const observer = new MutationObserver(injectEmojis);
observer.observe(document.body, { childList: true, subtree: true });

injectEmojis();
