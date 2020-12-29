## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Example picture](#Example)
- [Development](#development)
- [License](#license)

## Installation

``` bash
npm install vue-infinite-tree
```

or if you prefer yarn

``` bash
yarn add vue-infinite-tree
```

## Usage

Include the carousel directly into your component using import:

``` js
import InfiniteTree from 'vue-infinite-tree';

export default {
  ...
  components: {
    InfiniteTree,
  }
  ...
};
```

### Configuration
API与elementUI tree保持一致，暂不支持 checkbox与drag功能
| Property                  | Type    | Default | Description                                                                                                                                                                                                                                                                           |
|:--------------------------|:--------|:--------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| renderCount                    | Number  | 50    | 默认页面渲染的条数  

## Development

A sandboxed dev environment is provided by [vue-play](https://github.com/vue-play/vue-play). Changes made to the component files will appear in real time in the sandbox. 

To begin development, run:

``` bash
npm install 
npm run serve
```

or, if you prefer yarn

``` bash
yarn install 
yarn serve
```

then navigate to `http://localhost:8080`

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
