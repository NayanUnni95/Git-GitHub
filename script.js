document.addEventListener('DOMContentLoaded', () => {
    const commandsList = document.getElementById('commands-list');

    fetch('commands.json')
        .then(response => response.json())
        .then(data => {
            renderCommands(data.git_commands);
        })
        .catch(error => {
            console.error('Error loading commands:', error);
            commandsList.innerHTML = '<p style="color: red;">Error loading commands. Please check console.</p>';
        });

    function highlightCommand(cmd) {
        if (!cmd) return '';

        const tokens = cmd.split(' ');
        const verbs = ['init', 'config', 'add', 'restore', 'status', 'commit', 'log', 'checkout', 'branch', 'switch', 'merge', 'remote', 'push', 'clone', 'pull'];

        return tokens.map((token, i) => {
            const escapedToken = token.replace(/</g, '&lt;').replace(/>/g, '&gt;');

            if (i === 0 && token === 'git') {
                return `<span class="t-git">git</span>`;
            }
            if (token.startsWith('-')) {
                return `<span class="t-flag">${escapedToken}</span>`;
            }

            if (token.startsWith('<') && token.endsWith('>')) {
                return `<span class="t-placeholder">${escapedToken}</span>`;
            }

            if (token.startsWith('"') || token.endsWith('"') || token.startsWith("'") || token.endsWith("'")) {
                return `<span class="t-string">${escapedToken}</span>`;
            }

            if (verbs.includes(token)) {
                return `<span class="t-cmd">${escapedToken}</span>`;
            }
            if (token.includes('.') || token.includes('@') || i > 1) {
                return `<span class="t-param">${escapedToken}</span>`;
            }

            return escapedToken;
        }).join(' ');
    }

    function renderCommands(commands) {
        commands.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'command-card';

            setTimeout(() => {
                card.classList.add('visible');
            }, index * 40);

            card.innerHTML = `
                <p>${item.description}</p>
                <div class="code-container">
                    <code>${highlightCommand(item.command)}</code>
                </div>
            `;

            commandsList.appendChild(card);
        });
    }
});
