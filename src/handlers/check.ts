/**
 * This file is part of savant-ide.
 * Copyright (c) 2018 - present Zilliqa Research Pte. Ltd.
 *
 * savant-ide is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * savant-ide is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * savant-ide.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Request, Response, NextFunction } from 'express';
import uuid from 'uuid/v4';

import { checker, makeTempFileName, writeFiles } from '../util';
import { ScillaError } from '../util/error';
import { Paths } from '../constants';

export const check = async (req: Request, res: Response, next: NextFunction) => {
  const id = uuid();
  const checkOpt = {
    code: makeTempFileName(id, 'scilla'),
    stdlib: Paths.STDLIB,
  };

  const toWrite = Object.keys(checkOpt)
    .filter((file) => file !== 'stdlib')
    .map<{ path: string; data: string }>((k: string) => ({
      path: checkOpt[k as keyof typeof checkOpt],
      data: req.body[k] || '',
    }));

  try {
    await writeFiles(toWrite);
    const result = await checker(checkOpt);
    res.status(200).json({
      result: 'success',
      message: result,
    });
  } catch (err) {
    if (err instanceof ScillaError) {
      res.status(400).json({
        result: 'error',
        type:'scilla',
        message: err.messages,
      });
      return;
    }
    res.status(400).json({
      result: 'error',
      type:'scilla',
      message: err.message,
    });
  }
};
