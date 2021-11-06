const myAudio = $(".dashboard__audio"),
    musicPlayer = $(".music-player"),
    dashboardCD = $(".dashboard__cd"),
    cdThumb = $(".cd-thumb"),
    dashboardProgress = $(".dashboard__progress"),
    PLAYER_STORAGE_KEY = "F8 player";

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: "Xích Thêm Chút",
            singer: "RPT Groovie, tlinh, RPT MCK",
            path: "./assets/audio/song2.mp3",
            image: "./assets/image/img2.jpeg",
        },
        {
            name: "Thủ đô Cypher",
            singer: "RPT Orijinn, LowG, Maz, RPT MCK",
            path: "./assets/audio/song1.mp3",
            image: "./assets/image/img1.jpeg",
        },
        {
            name: "Tiền nhiều để làm gì",
            singer: "GDucky",
            path: "./assets/audio/song3.mp3",
            image: "./assets/image/img3.jpeg",
        },
        {
            name: "Eyes",
            singer: "GDucky",
            path: "./assets/audio/song4.mp3",
            image: "./assets/image/img4.jpeg",
        },
        {
            name: "Anh vẫn OK",
            singer: "RPT MCK",
            path: "./assets/audio/song5.mp3",
            image: "./assets/image/img5.jpeg",
        },
        {
            name: "Vòng suy nghĩ",
            singer: "Mai Âm Nhạc",
            path: "./assets/audio/song6.mp3",
            image: "./assets/image/img6.jpeg",
        },
        {
            name: 'Lane nào "BÁ" nhất?',
            singer: "LowG, Gừng, GDucky, RPT Orijinn. RPT T.C",
            path: "./assets/audio/song7.mp3",
            image: "./assets/image/img7.jpeg",
        },
        {
            name: "Thích Quá Rùi Nà",
            singer: "tlinf feat.Trung Trần",
            path: "./assets/audio/song8.mp3",
            image: "./assets/image/img8.jpeg",
        },
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="playlist__song ${index === app.currentIndex ? "active" : ""}" data-index="${index}">
                        <div class="thumb" style="background-image: url('${song.image}')"></div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="playlist__more">
                            <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                        </div>
                </div>
            `;
        });
        $(".music-player__playlist").html(htmls.join(""));
    },

    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },

    loadCurrentSong: function () {
        $(".dashboard__header h2").html(this.currentSong.name);
        cdThumb.css("backgroundImage", `url('${this.currentSong.image}')`);
        myAudio.attr("src", this.currentSong.path);
    },

    handleEvents: function () {
        const cdWidth = dashboardCD.width();

        // Xử lý quay/ dừng cd
        const cdThumbAnimate = cdThumb.get(0).animate({ transform: "rotate(360deg)" }, { duration: 10000, iterations: Infinity });
        cdThumbAnimate.pause();

        // Xử lý thu nhỏ cd khi scroll
        $(document).scroll(() => {
            const scrollTop = window.scrollY;
            const newCDWidth = cdWidth - scrollTop;

            dashboardCD.width(newCDWidth > 0 ? newCDWidth : 0);
            dashboardCD.css("opacity", newCDWidth / cdWidth);
        });

        // Xử lý khi click chạy bài hát
        $(".btn-toggle-play").click(() => {
            if (app.isPlaying) {
                myAudio.get(0).pause();
                cdThumbAnimate.pause();
            } else {
                myAudio.get(0).play();
                cdThumbAnimate.play();
            }

            // Khi bài hát được play
            myAudio.on("play", () => {
                app.isPlaying = true;
                musicPlayer.addClass("playing");
            });

            // Khi bài hát bị pause
            myAudio.on("pause", () => {
                app.isPlaying = false;
                musicPlayer.removeClass("playing");
            });

            // Khi tiến độ bài hát thay đổi
            myAudio.bind("timeupdate", () => {
                if (myAudio.get(0).duration) {
                    const progressPrecent = Math.floor((myAudio.get(0).currentTime / myAudio.get(0).duration) * 100);
                    dashboardProgress.val(progressPrecent);
                }
            });

            // Xử lý khi tua bài hát
            dashboardProgress.change((event) => {
                const seekTime = $(event.target).val() * (myAudio.get(0).duration / 100);
                myAudio.get(0).currentTime = seekTime;
            });

            // Xử lý chuyển bài hát next/ pre
            $(".btn-next").click(() => {
                if (app.isRandom) {
                    app.playRandomSong();
                } else {
                    app.nextSong();
                }
                myAudio.get(0).play();
                cdThumbAnimate.play();
                app.render();
                app.scrollToActiveSong();
            });

            $(".btn-pre").click(function () {
                if (app.isRandom) {
                    app.playRandomSong();
                } else {
                    app.previousSong();
                }
                myAudio.get(0).play();
                cdThumbAnimate.play();
                app.render();
                app.scrollToActiveSong();
            });

            // Bật/ tắt chế độ radom bài hát
            $(".btn-random").click(function () {
                app.isRandom = !app.isRandom;
                app.setConfig("isRandom", app.isRandom);
                $(this).toggleClass("active", app.isRandom);
            });

            // Bật/ tắt chế độ repeat bài hát
            $(".btn-repeat").click(function () {
                app.isRepeat = !app.isRepeat;
                app.setConfig("isRepeat", app.isRepeat);
                $(this).toggleClass("active", app.isRepeat);
            });

            // Xử lý song khi audio ended
            myAudio.on("ended", () => {
                if (app.isRepeat) {
                    myAudio.get(0).play();
                } else {
                    $(".btn-next").click();
                }
            });

            $(document).on("click", ".playlist__song", function () {
                if (!$(this).hasClass("active")) {
                    app.currentIndex = $(this).index();
                    app.loadCurrentSong();
                    app.render();
                    myAudio.get(0).play();
                    cdThumbAnimate.play();
                }
            });
        });
    },

    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    previousSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $(".playlist__song.active").get(0).scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 200);
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    start: function () {
        this.render();
        this.loadConfig();
        this.defineProperties();
        this.loadCurrentSong();
        this.handleEvents();
        $(".btn-random").toggleClass("active", app.isRandom);
        $(".btn-repeat").toggleClass("active", app.isRepeat);
    },
};

app.start();
