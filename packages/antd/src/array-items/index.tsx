import React, { useRef } from 'react'
import { ArrayField } from '@formily/core'
import {
  useField,
  observer,
  useFieldSchema,
  RecursionField,
  ReactFC,
} from '@formily/react'
import cls from 'classnames'
import {
  SortableContainer,
  SortableElement,
  SortableContainerProps,
  SortableElementProps,
} from 'react-sortable-hoc'
import { ISchema } from '@formily/json-schema'
import { usePrefixCls } from '../__builtins__'
import { ArrayBase, ArrayBaseMixins, IArrayBaseProps } from '../array-base'

type ComposedArrayItems = React.FC<
  React.PropsWithChildren<
    React.HTMLAttributes<HTMLDivElement> & IArrayBaseProps
  >
> &
  ArrayBaseMixins & {
    Item?: React.FC<
      React.HTMLAttributes<HTMLDivElement> & {
        type?: 'card' | 'divide'
      }
    >
  }

const SortableItem: ReactFC<
  React.HTMLAttributes<HTMLDivElement> & SortableElementProps
> = SortableElement(
  (props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => {
    const prefixCls = usePrefixCls('formily-array-items')
    return (
      <div {...props} className={cls(`${prefixCls}-item`, props.className)}>
        {props.children}
      </div>
    )
  }
) as any

const SortableList: ReactFC<
  React.HTMLAttributes<HTMLDivElement> & SortableContainerProps
> = SortableContainer(
  (props: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => {
    const prefixCls = usePrefixCls('formily-array-items')
    return (
      <div {...props} className={cls(`${prefixCls}-list`, props.className)}>
        {props.children}
      </div>
    )
  }
) as any

const isAdditionComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('Addition') > -1
}

const useAddition = () => {
  const schema = useFieldSchema()
  return schema.reduceProperties((addition, schema, key) => {
    if (isAdditionComponent(schema)) {
      return <RecursionField schema={schema} name={key} />
    }
    return addition
  }, null)
}

export const ArrayItems: ComposedArrayItems = observer((props) => {
  const field = useField<ArrayField>()
  const prefixCls = usePrefixCls('formily-array-items')
  const ref = useRef<HTMLDivElement>(null)
  const schema = useFieldSchema()
  const addition = useAddition()
  const dataSource = Array.isArray(field.value) ? field.value : []
  const { onAdd, onCopy, onRemove, onMoveDown, onMoveUp } = props
  if (!schema) throw new Error('can not found schema object')
  return (
    <ArrayBase
      onAdd={onAdd}
      onCopy={onCopy}
      onRemove={onRemove}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      <div
        {...props}
        ref={ref}
        onChange={() => {}}
        className={cls(prefixCls, props.className)}
      >
        <SortableList
          useDragHandle
          lockAxis="y"
          helperClass={`${prefixCls}-sort-helper`}
          helperContainer={() =>
            ref.current?.querySelector(`.${prefixCls}-list`)
          }
          onSortEnd={({ oldIndex, newIndex }) => {
            field.move(oldIndex, newIndex)
          }}
        >
          {dataSource?.map((item, index) => {
            const items = Array.isArray(schema.items)
              ? schema.items[index] || schema.items[0]
              : schema.items
            return (
              <ArrayBase.Item
                key={index}
                index={index}
                record={() => field.value?.[index]}
              >
                <SortableItem key={`item-${index}`} index={index}>
                  <div className={`${prefixCls}-item-inner`}>
                    <RecursionField schema={items} name={index} />
                  </div>
                </SortableItem>
              </ArrayBase.Item>
            )
          })}
        </SortableList>
        {addition}
      </div>
    </ArrayBase>
  )
})

ArrayItems.displayName = 'ArrayItems'

ArrayItems.Item = (props) => {
  const prefixCls = usePrefixCls('formily-array-items')
  return (
    <div
      {...props}
      onChange={() => {}}
      className={cls(`${prefixCls}-${props.type || 'card'}`, props.className)}
    >
      {props.children}
    </div>
  )
}

ArrayBase.mixin(ArrayItems)

export default ArrayItems
