'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Calendar, Globe, Monitor, User, Mail, Phone } from 'lucide-react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

interface LocationRecord {
  id: string
  latitude?: number
  longitude?: number
  accuracy?: number
  ipAddress?: string
  userAgent?: string
  screenResolution?: string
  timezone?: string
  language?: string
  formData?: {
    deviceModel?: string
    serialNumber?: string
    name?: string
    contactInfo?: string
  }
  timestamp?: any
  createdAt?: string
}

export default function TrackingPage() {
  const [records, setRecords] = useState<LocationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrackingData()
  }, [])

  const fetchTrackingData = async () => {
    try {
      const q = query(collection(db, 'device_locations'), orderBy('timestamp', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const data: LocationRecord[] = []
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as LocationRecord)
      })
      
      setRecords(data)
    } catch (error) {
      console.error('Error fetching tracking data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString()
  }

  const getMapLink = (lat?: number, lon?: number) => {
    if (!lat || !lon) return null
    return `https://www.google.com/maps?q=${lat},${lon}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tracking data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Device Tracking Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor all device registrations and location data
              </p>
            </div>
            <Link
              href="/return"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Form
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{records.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                With Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {records.filter(r => r.latitude && r.longitude).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unique IPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(records.map(r => r.ipAddress)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                With Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {records.filter(r => r.formData?.contactInfo).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tracking Records</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No tracking data found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Timestamp
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        IP Address
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Device
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <td className="py-4 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(record.timestamp)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {record.latitude && record.longitude ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <a
                                href={getMapLink(record.latitude, record.longitude) || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                              </a>
                              {record.accuracy && (
                                <span className="text-xs text-gray-500">
                                  ±{Math.round(record.accuracy)}m
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No location</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {record.ipAddress || 'N/A'}
                            </code>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {record.formData ? (
                            <div className="space-y-1">
                              {record.formData.name && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs">{record.formData.name}</span>
                                </div>
                              )}
                              {record.formData.contactInfo && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <a
                                    href={`mailto:${record.formData.contactInfo}`}
                                    className="text-blue-600 hover:underline text-xs"
                                  >
                                    {record.formData.contactInfo}
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No contact info</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-sm">
                          {record.formData?.deviceModel ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <Monitor className="w-3 h-3 text-gray-400" />
                                <span className="text-xs">{record.formData.deviceModel}</span>
                              </div>
                              {record.screenResolution && (
                                <span className="text-xs text-gray-500">{record.screenResolution}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Unknown</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
