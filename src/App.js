import axios from 'axios';
import React from 'react'
import './App.css';

const Label = ({ children, bordered }) => {
  return (
    <div className={bordered ? 'bordered label' : 'label'}>{children}</div>
  )
}

const Input = ({ value, onChange }) => {
  return (
    <input className='input' value={value} onChange={onChange} />
  )
}

const Button = ({ children, onClick }) => {
  return (
    <button className='btn' onClick={onClick}>{children}</button>
  )
}



function App() {
  const [license, setLicense] = React.useState('');
  const [repositoryUrl, setRepositoryUrl] = React.useState('https://github.com/aldyadk/tes-bikin-repo')
  const [contents, setContents] = React.useState([])

  const hitGithubApi = async () => {
    const ghIndex = repositoryUrl.indexOf('github.com/')
    if (ghIndex === -1) {
      alert('not valid url')
      return setRepositoryUrl('')
    }
    const splitRepoUrl = repositoryUrl.slice(ghIndex + 11).split('/')
    if (splitRepoUrl.length < 2) {
      alert('not valid url')
      return setRepositoryUrl('')
    }
    const user = splitRepoUrl[0]
    const repo = splitRepoUrl[1]
    try {
      let { data: repoData } = await axios.get(`https://api.github.com/repos/${user}/${repo}`)
      if (repoData.license === null) {
        setLicense('null (no license yet)')
      } else {
        setLicense(repoData.license)
      }
      const contentUrl = `https://api.github.com/repos/${user}/${repo}/contents`
      let { data: contents } = await axios.get(contentUrl)
      const fetchedContents = []
      async function recursivelyFetchFolderContents(value, lastUrl) {
        let { data: contents } = await axios.get(`https://api.github.com/repos/${user}/${repo}/contents/${value.name}`)
        console.log(contents)
        contents.forEach(value=>{
          if(value.type !== 'dir'){
            fetchedContents.push(value)
            setContents(fetchedContents)
          } else {
            recursivelyFetchFolderContents(value, lastUrl)
          }
        }) 
      }
      contents.forEach(value=>{
        if(value.type !== 'dir'){
          fetchedContents.push(value)
        } else {
          recursivelyFetchFolderContents(value, contentUrl)
        }
      }) 
    } catch (error) {
      alert('not found')
    }
  }
  return (
    <div className='App'>
      <div className='row'>
        <div className='col'>
          <Label>Repository Url</Label>
        </div>
        <div className='col'>
          <Input value={repositoryUrl} onChange={({ target: { value } }) => setRepositoryUrl(value)} />
        </div>

      </div>
      <div className='row'>
        <div className='col'>
          <Label>License Detail</Label>
        </div>
        <div className='col'>
          <Label>{license}</Label>
        </div>
      </div>
      <div className={contents.length ? 'row alternate' : 'row'}>
        <div className='col'>
          <Button onClick={hitGithubApi}>Hash Source Code</Button>
        </div>
        <div className='col'>
          {contents.map((value, index) => <Label key={index} bordered><pre>{JSON.stringify(value, null, 2)}</pre></Label>)}
        </div>

      </div>
    </div>
  );
}

export default App;
