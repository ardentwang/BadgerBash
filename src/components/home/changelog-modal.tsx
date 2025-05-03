'use client'
import React from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import changelog from '../../lib/changelog.json'

export default function ChangelogModal() {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Changelog</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {[...changelog].reverse().map((entry) => (
          <div key={entry.version} className="border-b pb-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">v{entry.version}</h3>
              <span className="text-sm">{entry.date}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {entry.changes.map((change, i) => (
                <li key={i} className="text-sm">• {change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DialogContent>
  );
}
