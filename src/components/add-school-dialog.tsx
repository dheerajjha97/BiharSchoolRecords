"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { School } from '@/lib/school';

interface AddSchoolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  udise: string;
  onSave: (school: School) => void;
}

export function AddSchoolDialog({ open, onOpenChange, udise, onSave }: AddSchoolDialogProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    // When the dialog opens or udise changes, reset the fields.
    if (open) {
        setName('');
        setAddress('');
    }
  }, [open, udise]);

  const handleSave = () => {
    if (name.trim() && address.trim()) {
      onSave({ udise, name: name.trim(), address: address.trim() });
      onOpenChange(false); // Close dialog on save
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New School</DialogTitle>
          <DialogDescription>
            The school for UDISE code {udise} is not yet registered. Please add the details below to save it for future use.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="udise-code" className="text-right">
              UDISE
            </Label>
            <Input id="udise-code" value={udise} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="school-name" className="text-right">
              School Name
            </Label>
            <div className="col-span-3 relative">
                <Input
                id="school-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter official school name"
                />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="school-address" className="text-right">
              Address
            </Label>
            <div className="col-span-3 relative">
                <Input
                id="school-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter full school address"
                />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !address.trim()}>Save and Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
