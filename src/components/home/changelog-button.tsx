'use client'
import React from 'react'
import { Dialog, DialogTrigger } from "../ui/dialog"
import ChangelogModal from './changelog-modal'

export default function ChangelogButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="fixed bottom-4 left-4 text-sm text-foreground/60 hover:text-foreground/80">
          Changelog
        </button>
      </DialogTrigger>
      <ChangelogModal />
    </Dialog>
  );
}