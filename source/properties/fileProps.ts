interface Property {
  name: string
  value: string
}

export class FileProps {
  constructor(
    readonly path: string,
    readonly props: object,
    readonly dirtyProps: object = {},
  ) {}

  withProperty = (name: string, value: string): FileProps => {
    const dirty = { [name]: value }
    return new FileProps(this.path, this.props, dirty)
  }

  property = (name: string): string => {
    return this.dirtyProps[name] || this.props[name]
  }

  all = (): Property[] => {
    return Object.keys({ ...this.props, ...this.dirtyProps }).reduce(
      (carry: Property[], key: string) => {
        carry.push({
          name: key,
          value: this.dirtyProps[key] || this.props[key],
        })
        return carry
      },
      [],
    )
  }

  dirty = (): Property[] => {
    return Object.keys(this.dirtyProps).reduce(
      (carry: Property[], key: string) => {
        carry.push({ name: key, value: this.dirtyProps[key] })
        return carry
      },
      [],
    )
  }
}
