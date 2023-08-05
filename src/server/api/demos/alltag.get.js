import { demos } from "../../data/demos";

const getAllTag = () => {
  let tags = new Set();
  demos.forEach(demo => {
    let len = demo.tags.length;
    let i = 0;
    while (i < len) {
      tags.add(demo.tags[i]);
      i++;
    }
  })
  return Array.from(tags).map(tag => ({
    tag: tag,
    count: count(tag)
  }))
}

const count = (tag) => {
  let result = 0;
  demos.forEach(demo => {
    if (demo.tags.indexOf(tag) > -1) {
      result += 1
    }
  })
  return result
}

export default defineEventHandler(async (event) => {
  return {
    tags: getAllTag()
  };
});
