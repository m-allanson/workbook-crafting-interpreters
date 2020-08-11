# About

My notes and code from working through [Crafting Interpreters](http://craftinginterpreters.com).

Browse the original book and source code at https://github.com/munificent/craftinginterpreters.

# Getting started

My notes and answers to the challenges for each chapter are in the `notes` directory.

## Running code

- `brew cask install java`
- `brew cask install intellij-idea-ce`
- `make jlox` to build jlox 
- `./jlox <path to file>`

*Tips*

Configure IntelliJ to automatically rebuild jlox when any of the source files change. Ensure the file watcher plugin is installed and follow [these steps](https://www.jetbrains.com/help/idea/using-file-watchers.html#ws_creating_file_watchers).

---

Run a specific Java file: 

`java -cp <buildDir> <classPath>`

e.g. to run `com.tekniskt.lox.AstPrinter.java`,  invoke: 

`java -cp build com.tekniskt.lox.AstPrinter` 

Ensure you have built jlox (`make jlox`) first.