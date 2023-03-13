

// @ts-ignore
var app = new Vue({
  el: '#app',
  data: {
    difficulty: 0, // 当前难度
    rayNums: 10, // 当前难度总雷数
    boxList: [], // 所有的方块对象
    rayList: [], // 所有的雷对象
    isGameOver: false, // 是否游戏结束
    gameOverTips: "", // 游戏结束提示语
  },
  methods: {
    // 切换难度
    changeDifficulty(event) {
      const target = event.target;
      if (target.nodeName === "LI") {
        if (target.innerText === "简单") {
          this.difficulty = 0;
          this.rayNums = 10;
        } else if (target.innerText === "复杂") {
          this.difficulty = 1;
          this.rayNums = 40;
        } else if (target.innerText === "困难") {
          this.difficulty = 2;
          this.rayNums = 100;
        }
        this.resetData();
        this.initBox();
      }
    },
    // 重置方块和雷的数据
    resetData() {
      this.boxList = []; // 所有的方块对象
      this.rayList = []; // 所有的雷对象
      this.isGameOver = false; // 是否游戏结束
    },
    // 生成对应的格子
    initBox() {
      let itemArr = [], i = 0;
      const j = this.row;
      if (this.difficulty === 0) {
        this.rayList = this.getRandomValue(64, this.rayNums);
      } else if (this.difficulty === 1) {
        this.rayList = this.getRandomValue(256, this.rayNums);
      } else if (this.difficulty === 2) {
        this.rayList = this.getRandomValue(625, this.rayNums);
      }
      for(i = 0; i < j * j; i++ ) {
        itemArr.push({
          index: i, // 下标
          isRay: this.rayList.includes(i), // 是不是雷
          isShow: false, // 是否已被翻开
          tagNum: 0, // 当前标记（0：未标记 1：标记为雷 2：不确定）
          value: 0, // 方块翻开后显示的值
        })
      }
      this.boxList = itemArr;
      this.getBoxValue();
      this.boxList.push();
    },
    // 生成随机数
    getRandomValue(val, num) {
      let list = [];
      while(list.length < num) {
        let random = Math.floor(Math.random() * val);
        if (!list.includes(random)) list.push(random);
      }
      return list;
    },
    // 循环遍历获取方块的值
    getBoxValue() {
      const j = this.row;
      this.boxList.forEach(item => {
        if (item.isRay) {
          item.value = null;
        } else {
          const list = this.getBoxAroundIndex(item.index, j);
          let val = 0;
          list.map(v => {
            if (this.boxList[v].isRay) val += 1;
          })
          item.value = val;
        }
      })
    },
    // 获取某个方块周围方块的下标
    getBoxAroundIndex(index, row) {
      let arr = [];
      if (index % row === 0) {
        arr = [index - row, index - row + 1, index + 1, index + row, index + row + 1];
      } else if (index % row ===  row - 1) {
        arr = [index - row - 1, index - row, index - 1, index + row - 1, index + row];
      } else {
        arr = [index - row - 1, index - row, index - row + 1, index - 1, index + 1, index + row - 1, index + row, index + row + 1];
      }
      arr = arr.filter(v => v >= 0 && v < row * row);
      return arr;
    },
    // 单击某个方块
    boxClcik(event) {
      let target = event.target;
      let item, index = 0;
      if (target.nodeName !== "LI") {
        target = target.parentNode;
      }
      const liList = document.getElementsByClassName("box-item");
      index = [...liList].indexOf(target);
      // 获取到点击的li的item值
      item = this.boxList[index];
      if (item.tagNum !== 1) {
        if (!item.isShow) {
          if (item.isRay) {
            item.isShow = true;
            return this.gameOver();
          } else {
            item.isShow = true;
            item.tagNum = 0;
            if (item.value === 0) {
              this.openZero(item);
            }
          }
        }
      }
    },
    // 双击某个方块
    boxDblClick(event) {
      let target = event.target;
      let item, index = 0;
      if (target.nodeName !== "LI") {
        target = target.parentNode;
      }
      const liList = document.getElementsByClassName("box-item");
      index = [...liList].indexOf(target);
      // 获取到点击的li的item值
      item = this.boxList[index];
      if (item.isShow && item.value !== 0) {
        // 如果该方块处于显示状态且值不为零，获取周围的方块
        let list = this.getBoxAroundIndex(item.index, this.row);
        let tagNumCount = list.filter(v => this.boxList[v].tagNum === 1).length;
        if (tagNumCount === item.value) {
          list.forEach(v => {
            if (this.boxList[v].tagNum !== 1) {
              this.boxList[v].isShow = true;
              // 如果是雷，游戏结束
              if (this.boxList[v].isRay) {
                this.isGameOver = true;
              }
              // 如果该方块为0，继续翻开方块
              if (this.boxList[v].value === 0) {
                this.openZero(this.boxList[v]);
              }
            }
          })
          if (this.isGameOver) {
            this.gameOverTips = "游戏结束！";
            this.boxList.forEach(v => {
              v.isShow = true;
              v.tagNum = 0;
            })
          }
        } else {
          const dblError = target.getElementsByClassName("dbl-error")[0];
          if (dblError.classList.contains("error-animation")) return;
          dblError.classList.add("error-animation");
          if (this.dblErrorTimer) clearTimeout(this.dblErrorTimer);
          this.dblErrorTimer = setTimeout(() => {
            dblError.classList.remove("error-animation");
          }, 900);
        }
      }
    },
    // 右击某个方块
    boxClickRight(event) {
      // 阻止右键的默认事件
      event.preventDefault();
      let target = event.target;
      let item, index = 0;
      if (target.nodeName !== "LI") {
        target = target.parentNode;
      }
      const liList = document.getElementsByClassName("box-item");
      index = [...liList].indexOf(target);
      // 获取到点击的li的item值
      item = this.boxList[index];
      if (!item.isShow) {
        if (item.tagNum < 2) {
          item.tagNum += 1;
        } else {
          item.tagNum = 0;
        }
      }
    },
    // 翻开周围所有为零的方块
    openZero(item) {
      if (item.value !== 0) return;
      let list = this.getBoxAroundIndex(item.index, this.row);
      if (list.length > 0) {
        list.forEach(v => {
          if (this.boxList[v].value !== 0) {
            this.boxList[v].isShow = true;
            if (this.boxList[v].tagNum) this.boxList[v].tagNum = 0;
          } else if (!this.boxList[v].isShow) {
            this.boxList[v].isShow = true;
            if (this.boxList[v].tagNum) this.boxList[v].tagNum = 0;
            this.openZero(this.boxList[v]);
          }
        })
      }
    },
    // 游戏结束
    gameOver(){
      this.gameOverTips = "游戏结束！";
      this.isGameOver = true;
      this.boxList.forEach(v => {
        v.isShow = true;
        v.tagNum = 0;
      })
    },
    // 重新开始
    startOver() {
      this.resetData();
      this.initBox();
    }
  },
  computed: {
    row() {
      if (this.difficulty === 0) {
        return 8;
      } else if (this.difficulty === 1) {
        return 16;
      } else if (this.difficulty === 2) {
        return 25;
      }
    },
    restBox() {
      return this.boxList.filter(v => !v.isShow);
    },
    restRays() {
      // 已标记的雷数
      let tagRayNums = this.boxList.filter(v => v.tagNum === 1).length;
      let res = this.rayNums - tagRayNums;
      return res >= 0 ? res : 0;
    }
  },
  mounted() {
    this.initBox();
  },
  watch: {
    restBox(val) {
      if (val.length === this.rayNums) {
        let res = true;
        val.forEach(v => {
          if (!v.isRay) {
            res = false;
          }
        })
        this.isGameOver = true;
        if (res) {
          this.gameOverTips = "恭喜通关！";
        } else {
          this.gameOverTips = "游戏结束！";
        }
        this.boxList.forEach(v => {
          v.isShow = true;
          v.tagNum = 0;
        })
      }
    },
  },
})