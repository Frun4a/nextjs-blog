import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'
import { useCallback } from 'react'

const postsDirectory = path.join(process.cwd(), 'posts')

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  
  const allPostsData = fileNames.map(fileName => {
    // Remove .md. from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResults = matter(fileContents)

    // Combine the data with  the id
    return {
      id,
      ...matterResults.data
    }
  })
  // Sort posts by date
  allPostsData.sort((a, b) => {
    if (a.data < b.data) {
      return 1
    } else {
      return -1
    }
  })

  return allPostsData
}

export function getAllPostsIds() {
  const fileNames = fs.readdirSync(postsDirectory)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]

  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // We use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // We use remark to convert makdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  }
}