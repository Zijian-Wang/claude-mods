# cache-timer

A small ring with an hourglass inside, drawn beside the model picker in the Claude desktop app. The ring drains over the one-hour prompt-cache window; hover for the exact time.

- orange: cache warm; red-orange: last 20%; ice blue: cache cold (the next message re-caches the whole prefix)
- terminal: a Nerd Font hourglass glyph (needs a Nerd Font)

The countdown restarts on every prompt and every finished turn. The 1h lifetime is fixed; the API does not report it to mods.

```
/plugin marketplace add Zijian-Wang/claude-mods
/plugin install cache-timer@zijian-mods
```
