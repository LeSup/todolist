export default class Interceptor {
  constructor() {
    this.aspects = [];
  }

  use(aspect) {
    this.aspects.push(aspect);
    return this;
  }

  async run(ctx) {
    const aspects = this.aspects;
    const compress = aspects.reduceRight((next, cur) => async () => {
      await cur(ctx, next);
    }, () => Promise.resolve());

    try {
      await compress();
    } catch(err) {
      console.log(err.message);
    }

    return ctx;
  }
}