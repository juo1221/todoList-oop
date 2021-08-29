const err = (v) => {
  throw v;
};
const el = (tag) => {
  return document.createElement(tag);
};

class Renderer {
  constructor(app) {
    this.app = app;
  }
  render() {
    this._render();
  }
  _render() {
    err("must be overrided");
  }
}

class DOMRenderer extends Renderer {
  constructor(parent, app) {
    super(app);
    this.el = parent.appendChild(el("section"));
    this.el.innerHTML = `
        <nav>
          <header>
            <h2>folders</header>
            <input type="text" />
          </header>
          <ul></ul>
        </nav>
        <section>
          <header>
            <h2>tasks</h2>
            <input type="text">
          </header>
          <ul></ul>
        </section>
      `;

    this.el.querySelector("nav").style.cssText =
      "float:left; width:200px; border-right:1px solid #000";

    this.el.querySelector("section").style.cssText =
      "float:left; margin-left: 50px; width:200px;";

    const ul = this.el.querySelectorAll("ul");
    const input = this.el.querySelectorAll("input");

    this.folders = ul[0];
    this.tasks = ul[1];
    this.currentFolder = null;

    input[0].addEventListener("keyup", (e) => {
      const title = e.target.value.trim();
      if (e.keyCode != 13 || !title) return;
      const folder = new Folder(title);
      this.app.addFolder(folder);
      e.target.value = "";
      e.target.focus();
      this.render();
    });
    input[1].addEventListener("keyup", (e) => {
      const title = e.target.value.trim();
      if (e.keyCode != 13 || !title || !this.currentFolder) return;
      const task = new Task(title);
      this.currentFolder.addTask(task);
      e.target.value = "";
      e.target.focus();
      this.render();
    });
  }
  _render() {
    const folders = this.app.getFolders();
    if (!this.currentFolder) this.currentFolder = folders[0];
    this.folders.innerHTML = "";
    folders.forEach((folder) => {
      const li = el("li");
      li.innerHTML = folder.getTitle();
      li.style.cssText =
        "font-size:" + (this.currentFolder == folder ? "20px" : "12px");
      li.addEventListener("click", () => {
        this.currentFolder = folder;
        this.render();
      });
      this.folders.appendChild(li);
    });
    if (!this.currentFolder) return;
    this.tasks.innerHTML = "";
    this.currentFolder.getTasks().forEach((task) => {
      const li = el("li");
      const { title, isCompleted } = task.getInfo();
      li.innerHTML = isCompleted
        ? `<p style="text-decoration:line-through">${title}</p>`
        : `<p>${title}</p>`;
      li.addEventListener("click", () => {
        task.toggle();
        this.render();
      });
      this.tasks.appendChild(li);
    });
  }
}

new DOMRenderer(document.body, new App());
