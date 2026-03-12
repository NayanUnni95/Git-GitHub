document.addEventListener('DOMContentLoaded', () => {
    const commandsList = document.getElementById('commands-list');
    const searchInput = document.getElementById('search-input');
    const downloadBtn = document.getElementById('download-btn');
    const themeToggle = document.getElementById('theme-toggle');
    let allCommands = [];

    // Theme Logic
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    fetch('commands.json')
        .then(response => response.json())
        .then(data => {
            allCommands = data.git_commands;
            renderCommands(allCommands);
        })
        .catch(error => {
            console.error('Error loading commands:', error);
            commandsList.innerHTML = '<p style="color: red;">Error loading commands. Please check console.</p>';
        });

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allCommands.filter(item =>
            item.command.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        );
        renderCommands(filtered, true);
    });

    downloadBtn.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("Git & GitHub Cheat Sheet", 20, 20);

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text("A beginner-friendly guide to version control.", 20, 30);

        doc.setDrawColor(230);
        doc.line(20, 35, 190, 35);

        let y = 45;
        allCommands.forEach((item, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setTextColor(0);
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${item.description}`, 20, y);
            y += 7;

            doc.setFont("courier", "bold");
            doc.setTextColor(215, 58, 73);
            doc.setFontSize(11);
            doc.text(item.command, 25, y);
            y += 15;
        });

        doc.save("Git_Cheat_Sheet.pdf");
    });

    function highlightCommand(cmd) {
        if (!cmd) return '';
        const tokens = cmd.split(' ');
        const verbs = ['init', 'config', 'add', 'restore', 'status', 'commit', 'log', 'checkout', 'branch', 'switch', 'merge', 'remote', 'push', 'clone', 'pull'];

        return tokens.map((token, i) => {
            const escapedToken = token.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            if (i === 0 && token === 'git') return `<span class="t-git">git</span>`;
            if (token.startsWith('-')) return `<span class="t-flag">${escapedToken}</span>`;
            if (token.startsWith('<') && token.endsWith('>')) return `<span class="t-placeholder">${escapedToken}</span>`;
            if (token.startsWith('"') || token.endsWith('"') || token.startsWith("'") || token.endsWith("'")) return `<span class="t-string">${escapedToken}</span>`;
            if (verbs.includes(token)) return `<span class="t-cmd">${escapedToken}</span>`;
            if (token.includes('.') || token.includes('@') || i > 1) return `<span class="t-param">${escapedToken}</span>`;
            return escapedToken;
        }).join(' ');
    }

    function renderCommands(commands, isFilter = false) {
        commandsList.innerHTML = '';
        if (commands.length === 0) {
            commandsList.innerHTML = '<p class="no-results fade-in">No matching commands found.</p>';
            return;
        }

        commands.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'command-card';
            setTimeout(() => card.classList.add('visible'), isFilter ? index * 20 : index * 40);

            card.innerHTML = `
                <p>${item.description}</p>
                <div class="code-container">
                    <code>${highlightCommand(item.command)}</code>
                    <button class="copy-btn" title="Copy to clipboard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            `;

            const copyBtn = card.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(item.command).then(() => {
                    copyBtn.classList.add('copied');
                    const originalSVG = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        copyBtn.innerHTML = originalSVG;
                    }, 2000);
                });
            });
            commandsList.appendChild(card);
        });
    }
});
