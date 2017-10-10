# gulp-bower-scss-twig-starter-kit

## 설치
```sh
git clone https://github.com/skt-t1-byungi/gulp-bower-scss-twig-starter-kit.git
cd gulp-bower-scss-twig-starter-kit
npm install
npm run bower install

//로컬 gulp 명령
npm run gulp [command]

//로컬 bower 명령
npm run bower [command]
```

## 폴더구성
```
gulp-bower-scss-twig-starter-kit
├─dev      // 중간빌드 (browserSync)
├─dist     // 최종빌드
└─src
    ├─image   // 이미지파일
    ├─script  // js 파일 (preprocess 지원)
    ├─scss    // scss 파일
    ├─sprites // sprites css 저장
    └─twig    // twig 파일

gulpfile.js
bower.json
package.json
README.md
```

## 작업흐름
- vendor(css, js) 라이브러리를 bower를 이용해 추가 `npm run bower install [package]`
- browsersync 실행 `npm run gulp serve`
- `src/[filetype]` 각 폴더에서 작업진행.
  - 언더바(`_`)로 시작되는 파일은 컴파일제외.
  - 코드 내 파일 경로는 `package.json`의 `paths` 경로에 맞춰 컴파일됨.
- 최종빌드 `npm run gulp build`

## gulp 태스크 목록
#### gulp watch
`src` 파일들을 감시하고 파일이 변경되면 `gulp dev`를 실행됩니다.

#### gulp serve
browserSync와 `gulp watch`를 실행합니다. `gulp serve:re` 명령어를 통해 브라우저를 새로 열지 않고 실행할 수 있습니다.

#### gulp bower
bower파일들을 vendor파일(vendor.css, vendor.js)로 합쳐 중간빌드폴더(dev)로 복사합니다.

#### gulp dev
`src` 파일을 중간빌드합니다. `gulp [filetype]`을 통해 타입별로 중간빌드 할 수도 있습니다. (예: `gulp twig`, `gulp scss`)

#### gulp build
`src` 파일을 최종빌드합니다. 최종빌드 과정중에는 중간빌드(`gulp dev`)가 포함되어 있습니다.

#### gulp sprites
이미지 파일을 합쳐 sprite 이미지와 css파일을 생성합니다. `package.json`의 `paths.sprites`에 생성할 sprite 이미지정보를 정의합니다. 이미지는 중간빌드폴더(dev)의 `paths.DIR_IMAGE` 경로에 저장됩니다. css파일은 `src/sprites/` 아래에 저장됩니다.

#### gulp clean
sprites로 생성된 css파일, 중간빌드, 최종빌드 파일을 제거합니다.

### gulp bump
package.json, bower.json 버전을 업데이트(patch)합니다.

### gulp w3c
최종빌드된 html 파일 마크업을 검사합니다.
