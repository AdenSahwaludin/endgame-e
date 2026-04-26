<template>
  <div>
    <NuxtLayout>
      <NuxtPage :page-key="(route) => route.fullPath" />
    </NuxtLayout>
  </div>
</template>
