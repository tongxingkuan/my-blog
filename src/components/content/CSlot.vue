<template>
  <div>
    <p style="border: 1px solid; padding: .5rem">
      <slot></slot>
    </p>
    <hr />
    <slot name="namedSlot"></slot>
  </div>
</template>