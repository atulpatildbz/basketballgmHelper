import { useState, useMemo } from 'react'
import { read, utils } from 'xlsx'
import Select from 'react-select'
import './App.css'

interface PlayerData {
  pid: string
  Name: string
  Pos: string
  Season: number
  Ovr: number
  Pot: number
  [key: string]: string | number
}

interface PlayerOption {
  value: string
  label: string
}

interface ComparisonPlayer {
  Name: string
  Position: string
  overallDiff: number
  potentialDiff: number
  fromOverall: number
  toOverall: number
  fromPotential: number
  toPotential: number
  [key: string]: string | number
}

function App() {
  const [data, setData] = useState<PlayerData[]>([])
  const [year1, setYear1] = useState<string>('')
  const [year2, setYear2] = useState<string>('')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerOption | null>(null)
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null)
  const [nameFilter, setNameFilter] = useState<string>('')

  const playerOptions = useMemo(() => {
    const uniqueNames = Array.from(new Set(data.map(player => player.Name)))
    return uniqueNames.map(name => ({
      value: name,
      label: name
    }))
  }, [data])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const file = e.target.files[0]
    const data = await file.arrayBuffer()
    const workbook = read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = utils.sheet_to_json<PlayerData>(worksheet)
    setData(jsonData)
  }

  const getPlayersForComparison = () => {
    if (!year1 || !year2) return []
    const relevantPlayers = data.filter(player => 
      player.Season === parseInt(year1) || player.Season === parseInt(year2)
    )

    const playerMap = new Map()
    relevantPlayers.forEach(player => {
      if (!playerMap.has(player.Name)) {
        playerMap.set(player.Name, {
          Name: player.Name,
          Pos: player.Pos,
          year1Data: null,
          year2Data: null
        })
      }
      if (player.Season === parseInt(year1)) {
        playerMap.get(player.Name).year1Data = player
      } else if (player.Season === parseInt(year2)) {
        playerMap.get(player.Name).year2Data = player
      }
    })

    return Array.from(playerMap.values())
      .filter(player => player.year1Data && player.year2Data)
      .map(player => ({
        Name: player.Name,
        Position: player.Pos,
        overallDiff: player.year2Data.Ovr - player.year1Data.Ovr,
        potentialDiff: player.year2Data.Pot - player.year1Data.Pot,
        fromOverall: player.year1Data.Ovr,
        toOverall: player.year2Data.Ovr,
        fromPotential: player.year1Data.Pot,
        toPotential: player.year2Data.Pot
      })) as ComparisonPlayer[]
  }

  const getPlayerHistory = (playerName: string | null) => {
    if (!playerName) return []
    return data
      .filter(player => player.Name === playerName)
      .sort((a, b) => a.Season - b.Season)
  }

  const sortedPlayers = () => {
    const players = getPlayersForComparison()
    let filteredPlayers = players

    // Apply name filter
    if (nameFilter.trim()) {
      const names = nameFilter.split(',').map(name => name.trim().toLowerCase())
      filteredPlayers = players.filter(player => 
        names.some(name => player.Name.toLowerCase().includes(name))
      )
    }

    if (!sortConfig) return filteredPlayers

    return [...filteredPlayers].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getPlayerRatingClass = (overall: number) => {
    if (overall > 70) return 'elite-player'
    if (overall >= 60) return 'great-player'
    if (overall >= 50) return 'good-player'
    if (overall >= 40) return 'average-player'
    return 'below-average-player'
  }

  const handlePlayerClick = (playerName: string) => {
    const option = { value: playerName, label: playerName }
    setSelectedPlayer(option)
  }

  const getSortClass = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return ''
    return sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc'
  }

  return (
    <div className="container">
      <div className="controls">
        <input 
          type="file" 
          accept=".csv,.xlsx,.xls" 
          onChange={handleFileUpload}
          className="file-input"
        />
        <div className="year-inputs">
          <input
            type="number"
            placeholder="From Year"
            value={year1}
            onChange={(e) => setYear1(e.target.value)}
            className="year-input"
          />
          <input
            type="number"
            placeholder="To Year"
            value={year2}
            onChange={(e) => setYear2(e.target.value)}
            className="year-input"
          />
        </div>
      </div>

      <div className="content">
        <div className="comparison-table">
          <div className="filter-container">
            <input
              type="text"
              placeholder="Filter by names (comma-separated)"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="name-filter"
            />
            {nameFilter && (
              <button 
                onClick={() => setNameFilter('')}
                className="clear-filter"
              >
                Clear
              </button>
            )}
          </div>
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('Name')} className={getSortClass('Name')}>Name</th>
                <th onClick={() => requestSort('Position')} className={getSortClass('Position')}>Position</th>
                <th onClick={() => requestSort('overallDiff')} className={getSortClass('overallDiff')}>Overall diff</th>
                <th onClick={() => requestSort('potentialDiff')} className={getSortClass('potentialDiff')}>Potential diff</th>
                <th onClick={() => requestSort('fromOverall')} className={getSortClass('fromOverall')}>From overall</th>
                <th onClick={() => requestSort('toOverall')} className={getSortClass('toOverall')}>To overall</th>
                <th onClick={() => requestSort('fromPotential')} className={getSortClass('fromPotential')}>From potential</th>
                <th onClick={() => requestSort('toPotential')} className={getSortClass('toPotential')}>To potential</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers().map((player, idx) => (
                <tr key={idx} className={getPlayerRatingClass(player.toOverall)}>
                  <td>
                    <span 
                      className="player-name"
                      onClick={() => handlePlayerClick(player.Name)}
                    >
                      {player.Name}
                    </span>
                  </td>
                  <td>{player.Position}</td>
                  <td>{player.overallDiff.toFixed(1)}</td>
                  <td>{player.potentialDiff.toFixed(1)}</td>
                  <td>{player.fromOverall.toFixed(1)}</td>
                  <td>{player.toOverall.toFixed(1)}</td>
                  <td>{player.fromPotential.toFixed(1)}</td>
                  <td>{player.toPotential.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="player-search">
          <Select
            value={selectedPlayer}
            onChange={(option) => setSelectedPlayer(option)}
            options={playerOptions}
            className="select-input"
            classNamePrefix="select"
            placeholder="Search player..."
            isClearable
          />
          {selectedPlayer && (
            <table className="player-history">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Overall</th>
                  <th>Potential</th>
                </tr>
              </thead>
              <tbody>
                {getPlayerHistory(selectedPlayer.value).map((player, idx) => (
                  <tr key={idx} className={getPlayerRatingClass(player.Ovr)}>
                    <td>{player.Season}</td>
                    <td>{player.Ovr}</td>
                    <td>{player.Pot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
